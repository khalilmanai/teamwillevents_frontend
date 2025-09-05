import { io, type Socket } from "socket.io-client"
import type {
  User,
  Event,
  PaginatedResponse,
  CreateTaskDto,
  Task,
  TaskStatus,
  SendNotificationDto,
  Notification,
  Message,
  MessageReaction,
  UpdateProfileData,
  ChangePasswordData,
  CostItem,
  EventSeries,
} from "./types"
import type { Role } from "./roles"
import type { EventStatus } from "./event-status"

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
const ACCESS_TOKEN_KEY = "access_token"
const SOCKET_RECONNECTION_DELAY = 1000
const SOCKET_MAX_RECONNECT_ATTEMPTS = 5
const DEFAULT_REQUEST_TIMEOUT = 10000
const DEFAULT_RETRY_ATTEMPTS = 2
const DEFAULT_RETRY_DELAY = 500

// Type Definitions
interface AuthResponse {
  user: User
  access_token: string
}

interface AvatarUploadResponse {
  avatarUrl: string
  avatarPublicId?: string
}

interface SocketEventCallbacks {
  connect: () => void
  disconnect: () => void
  "message:created": (message: Message) => void
  "message:reaction": (reaction: MessageReaction) => void
  "message:deleted": (data: { messageId: string; eventId: string }) => void
  "message:edited": (message: Message) => void
  "user:joined": (data: { eventId: string; user: User }) => void
  "user:left": (data: { eventId: string; userId: string }) => void
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface RequestOptions extends RequestInit {
  retryAttempts?: number
  retryDelay?: number
  cacheTtl?: number
  skipJson?: boolean
}

class ApiService {
  private token: string | null = null
  private socket: Socket | null = null
  private socketListeners = new Map<string, ((data: any) => void)[]>()
  private reconnectAttempts = 0
  private activeRequests = new Map<string, AbortController>()
  private requestCache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()

  constructor() {
    if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
      throw new Error("[ApiService] NEXT_PUBLIC_API_URL is not set in production.")
    }
  }

  // ==================== TOKEN MANAGEMENT ====================
  private async getToken(): Promise<string | null> {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem(ACCESS_TOKEN_KEY)
    }
    return this.token
  }

  private async setToken(token: string): Promise<void> {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    }
  }

  private async clearToken(): Promise<void> {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  }

  // ==================== CACHE MANAGEMENT ====================
  private getCacheKey(endpoint: string, method: string, params?: Record<string, any>): string {
    const paramString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return `${method}:${endpoint}${paramString}`
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    const cached = this.requestCache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.requestCache.delete(key)
      return null
    }

    return cached.data as T
  }

  private async setCache(key: string, data: any, ttl: number): Promise<void> {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  public async invalidateCache(endpointPrefix: string): Promise<void> {
    for (const key of this.requestCache.keys()) {
      if (key.includes(endpointPrefix)) {
        this.requestCache.delete(key)
      }
    }
  }

  // ==================== HTTP REQUEST HANDLER ====================
 async request<T>(
    endpoint: string,
    options: RequestOptions = {},
    skipJson = false,
    cacheTtl?: number,
  ): Promise<T> {
    const { retryAttempts = DEFAULT_RETRY_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY, ...fetchOptions } = options
    const method = fetchOptions.method || "GET"
    const cacheKey = this.getCacheKey(
      endpoint,
      method,
      method === "GET" && fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
    )

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!
    }

    // Check cache for GET requests
    if (method === "GET" && cacheTtl) {
      const cachedData = await this.getFromCache<T>(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    const controller = new AbortController()
    const requestId = `${endpoint}-${Date.now()}`
    this.activeRequests.set(requestId, controller)

    const headers = new Headers(fetchOptions.headers)
    if (!skipJson && !(fetchOptions.body instanceof FormData)) {
      headers.set("Content-Type", "application/json")
    }

    const token = await this.getToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    }

    const requestPromise = (async () => {
      let lastError: Error | null = null
      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          const timeout = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT)
          const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
          clearTimeout(timeout)
          this.activeRequests.delete(requestId)

          if (!response.ok) {
            let errorMessage = `Error ${response.status}`
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorMessage
            } catch {}
            throw new Error(errorMessage)
          }

          const result = response.status === 204 ? undefined : await response.json()

          if (method === "GET" && cacheTtl && result) {
            await this.setCache(cacheKey, result, cacheTtl)
          }

          return result as T
        } catch (error: any) {
          lastError = error
          if (error.name === "AbortError") {
            throw new Error(`Request timed out: ${endpoint}`)
          }
          if (attempt < retryAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
            continue
          }
        }
      }
      this.activeRequests.delete(requestId)
      throw lastError || new Error(`Request failed after ${retryAttempts + 1} attempts: ${endpoint}`)
    })()

    if (method === "GET") {
      this.pendingRequests.set(cacheKey, requestPromise)
      try {
        return await requestPromise
      } finally {
        this.pendingRequests.delete(cacheKey)
      }
    }

    return requestPromise
  }

  // ==================== AUTHENTICATION ====================
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    await this.setToken(response.access_token)
    const freshUser = await this.getCurrentUser()
    return {
      ...response,
      user: freshUser!,
    }
  }

  async logout(): Promise<void> {
    await this.disconnectSocket()
    await this.clearToken()
    this.requestCache.clear()
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  async forgotPassword(email: string): Promise<void> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    })
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // ==================== USER MANAGEMENT ====================
  async getCurrentUser(): Promise<User | null> {
    const token = await this.getToken()
    if (!token) return null

    try {
      return await this.request<User>("/users/me", { method: "GET" }, false, 30000)
    } catch (error: any) {
      if (error.message.includes("Unauthorized")) {
        await this.clearToken()
        return null
      }
      throw error
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return this.request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData()
    formData.append("file", file)
    return this.request<AvatarUploadResponse>(
      "/users/me/avatar",
      {
        method: "PATCH",
        body: formData,
      },
      true,
    )
  }
  async uploadEventImage(eventId: string, file: File): Promise<{ imageUrl: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return this.request<{ imageUrl: string; publicId: string }>(
    `/events/${eventId}/image`,
    {
      method: "POST",
      body: formData,
    },
    true // skipJson to avoid overriding Content-Type for FormData
  );
}


  async deleteUserAvatar(): Promise<void> {
    return this.request("/users/me/avatar", { method: "DELETE" })
  }

  async getUsers(): Promise<User[]> {
    return this.request("/users", { method: "GET" }, false, 60000)
  }

  async getUserById(id: string): Promise<User> {
    return this.request(`/users/${id}`, { method: "GET" }, false, 300000)
  }

  async createUser(data: Partial<User> & { password: string; role: Role }): Promise<User> {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUser(id: string, data: UpdateProfileData): Promise<User> {
    return this.request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, { method: "DELETE" })
  }

  // ==================== EVENT MANAGEMENT ====================
  async getEvents(): Promise<Event[]> {
    return this.request("/events", { method: "GET" }, false, 60000)
  }

  async getEventSeries(): Promise<EventSeries[]> {
    return this.request("/event-series", { method: "GET" }, false, 60000)
  }

  async createEventSeries(data: { name: string; description?: string }): Promise<EventSeries> {
    return this.request("/event-series", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getEventSeriesById(id: string): Promise<EventSeries> {
    return this.request(`/event-series/${id}`, { method: "GET" }, false, 300000)
  }

  async updateEventSeries(id: string, data: { name?: string; description?: string }): Promise<EventSeries> {
    return this.request(`/event-series/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteEventSeries(id: string): Promise<{ message: string }> {
    return this.request(`/event-series/${id}`, { method: "DELETE" })
  }

  async getMyEvents(page?: number, limit?: number, status?: string[]): Promise<PaginatedResponse<Event>> {
    const query = new URLSearchParams()
    if (page) query.append("page", page.toString())
    if (limit) query.append("limit", limit.toString())
    if (status?.length) status.forEach((s) => query.append("status", s))

    return this.request(`/events/user/my-events?${query.toString()}`, { method: "GET" }, false, 30000)
  }

  async getEvent(id: string): Promise<Event> {
    return this.request(`/events/${id}`, { method: "GET" }, false, 300000)
  }

  async createEvent(formData: FormData): Promise<Event> {
    return this.request<Event>("/events", { method: "POST", body: formData }, true)
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    return this.request(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) })
  }

  // Updated: now deleteEvent returns { message: string }
  async deleteEvent(id: string): Promise<{ message: string }> {
    return this.request(`/events/${id}`, { method: "DELETE" })
  }

  // ==================== EVENT PARTICIPATION ====================
  async participate(eventId: string): Promise<void> {
    return this.request(`/events/${eventId}/participate`, { method: "POST" })
  }

  async cancelParticipation(eventId: string): Promise<void> {
    return this.request(`/events/${eventId}/cancel`, { method: "POST" })
  }

  async verifyParticipation(eventId: string, userId: string): Promise<{ registered: boolean; confirmed?: boolean }> {
    return this.request(`/participation/${eventId}/${userId}/verify`, { method: "GET" })
  }

  // Updated: invite endpoint uses URL param
  async inviteToEvent(eventId: string, userId: string): Promise<void> {
    return this.request(`/events/${eventId}/invite/${userId}`, { method: "POST" })
  }

  async getUserEvents(
    userId: string,
    options: { page?: number; limit?: number; status?: string[] } = {},
  ): Promise<PaginatedResponse<Event>> {
    const { page = 1, limit = 10, status } = options
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status?.length) status.forEach((s) => params.append("status", s))

    return this.request<PaginatedResponse<Event>>(
      `/events/user/my-events?${params.toString()}`,
      { method: "GET" },
      false,
      30000,
    )
  }

  async getEventsByStatus(status: EventStatus): Promise<Event[]> {
    return this.request<Event[]>(`/events/status/${status}`, { method: "GET" }, false, 60000)
  }

  async addOrganizer(eventId: string, userId: string): Promise<void> {
    return this.request(`/events/${eventId}/add-organizer`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
  }

  async getParticipants(eventId: string): Promise<User[]> {
    return this.request(`/events/${eventId}/participants`, { method: "GET" }, false, 30000)
  }

  async getUserParticipations(userId: string): Promise<
    Array<{
      eventId: string
      title: string
      date: string
      time: string
      location: string
      imageUrl: string | null
      manager: string | null
    }>
  > {
    return this.request(`/participation/${userId}`, { method: "GET" })
  }

  async getEventParticipants(eventId: string): Promise<User[]> {
    return this.request(`/events/${eventId}/participants`, { method: "GET" }, false, 30000)
  }
  // ==================== MESSAGING SYSTEM ====================
  async getMessages(eventId: string, page = 1, pageSize = 30): Promise<Message[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    return this.request(`/messages/event/${eventId}?${params.toString()}`, { method: "GET" }, false, 10000)
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    const socket = await this.connectSocket()
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Edit message timeout"))
      }, DEFAULT_REQUEST_TIMEOUT)

      socket.emit("editMessage", { messageId, content }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) return reject(new Error(response.error))
        resolve(response as Message)
      })
    })
  }

  async uploadMedia(formData: FormData, onProgress?: (progress: number) => void): Promise<Message> {
    const token = await this.getToken()
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${API_BASE_URL}/messages/upload`, true)
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      }

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress((event.loaded / event.total) * 100)
          }
        }
      }

      const timeout = setTimeout(() => {
        xhr.abort()
        reject(new Error("Upload media timeout"))
      }, DEFAULT_REQUEST_TIMEOUT)

      xhr.onload = () => {
        clearTimeout(timeout)
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as Message)
        } else {
          reject(new Error(xhr.statusText))
        }
      }

      xhr.onerror = () => {
        clearTimeout(timeout)
        reject(new Error("Network error during media upload"))
      }

      xhr.send(formData)
    })
  }

  // ==================== SOCKET.IO IMPLEMENTATION ====================
  private async connectSocket(): Promise<Socket> {
    if (this.socket?.connected) return this.socket

    const token = await this.getToken()
    if (!token) throw new Error("Authentication required")

    if (this.socket) {
      this.socket.disconnect()
      this.socketListeners.forEach((_, event) => this.removeSocketListener(event, () => {}))
      this.socketListeners.clear()
    }

    this.socket = io(`${API_BASE_URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
      upgrade: false,
      forceNew: true,
      timeout: DEFAULT_REQUEST_TIMEOUT,
      reconnection: true,
      reconnectionAttempts: SOCKET_MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: SOCKET_RECONNECTION_DELAY,
    })

    this.socket
      .on("connect", () => {
        console.log("[ApiService] Socket connected")
        this.reconnectAttempts = 0
        this.socketListeners.get("connect")?.forEach((cb) => cb({}))
      })
      .on("disconnect", (reason) => {
        console.log("[ApiService] Socket disconnected:", reason)
        this.socketListeners.get("disconnect")?.forEach((cb) => cb({}))
      })
      .on("connect_error", (err) => {
        console.error("[ApiService] Socket connection error:", err.message)
        this.reconnectAttempts++
        if (this.reconnectAttempts >= SOCKET_MAX_RECONNECT_ATTEMPTS) {
          console.error("[ApiService] Max reconnection attempts reached")
        }
      })
      .on("reconnect", (attemptNumber) => {
        console.log("[ApiService] Socket reconnected after", attemptNumber, "attempts")
      })

    this.socketListeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => this.socket?.on(event, callback))
    })

    return this.socket
  }

  async disconnectSocket(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.socketListeners.clear()
    }
  }

  public async connectToSocket(): Promise<Socket> {
    return this.connectSocket()
  }

  // Room Management
  async joinEventRoom(eventId: string): Promise<void> {
    const socket = await this.connectSocket()
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Join room timeout"))
      }, DEFAULT_REQUEST_TIMEOUT)

      socket.emit("joinEventRoom", { eventId }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) return reject(new Error(response.error))
        if (response?.success) resolve()
        else reject(new Error("Failed to join room"))
      })
    })
  }

  async leaveEventRoom(eventId: string): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      console.warn("[ApiService] Socket not connected; skipping leaveEventRoom")
      return
    }
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn("[ApiService] Non-critical timeout in leaveEventRoom")
        resolve()
      }, DEFAULT_REQUEST_TIMEOUT)

      this.socket!.emit("leaveEventRoom", { eventId }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) return reject(new Error(response.error))
        resolve()
      })
    }).catch((error) => {
      console.warn("[ApiService] Non-critical error in leaveEventRoom:", error)
      return
    })
  }

  // Message Operations
  async sendMessage(data: {
    eventId: string
    content: string
    type?: "text" | "image" | "video" | "file"
    mediaUrl?: string
    replyToId?: string
  }): Promise<Message> {
    const socket = await this.connectSocket()
    const validTypes = ["text", "image", "video", "file"]
    if (data.type && !validTypes.includes(data.type)) {
      throw new Error(`Invalid message type: ${data.type}`)
    }
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Send message timeout"))
      }, 30000)

      socket.emit("sendMessage", { ...data, type: data.type || "text" }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) {
          return reject(new Error(response.error))
        }
        resolve(response as Message)
      })
    })
  }

  async reactToMessage(eventId: string, messageId: string, emoji: string): Promise<void> {
    const socket = await this.connectSocket()
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("React to message timeout"))
      }, DEFAULT_REQUEST_TIMEOUT)

      socket.emit("reactToMessage", { eventId, messageId, emoji }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) return reject(new Error(response.error))
        resolve()
      })
    })
  }

  async removeReaction(eventId: string, messageId: string, emoji: string): Promise<void> {
    const socket = await this.connectSocket()
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Remove reaction timeout"))
      }, DEFAULT_REQUEST_TIMEOUT)

      socket.emit("removeReaction", { eventId, messageId, emoji }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) return reject(new Error(response.error))
        resolve()
      })
    })
  }

  async deleteMessage(eventId: string, messageId: string): Promise<void> {
    const socket = await this.connectSocket()
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Delete message timeout"))
      }, DEFAULT_REQUEST_TIMEOUT)

      socket.emit("deleteMessage", { eventId, messageId }, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) return reject(new Error(response.error))
        resolve()
      })
    })
  }

  // Event Listeners
  onMessage(callback: (message: Message) => void): () => void {
    return this.addSocketListener("message:created", callback)
  }

  onMessageReaction(callback: (reaction: MessageReaction) => void): () => void {
    return this.addSocketListener("message:reaction", callback)
  }

  onMessageDeleted(callback: (data: { messageId: string; eventId: string }) => void): () => void {
    return this.addSocketListener("message:deleted", callback)
  }

  onMessageEdited(callback: (message: Message) => void): () => void {
    return this.addSocketListener("message:edited", callback)
  }

  onUserJoined(callback: (data: { eventId: string; user: User }) => void): () => void {
    return this.addSocketListener("user:joined", callback)
  }

  onUserLeft(callback: (data: { eventId: string; userId: string }) => void): () => void {
    return this.addSocketListener("user:left", callback)
  }

  onSocketConnect(callback: SocketEventCallbacks["connect"]): () => void {
    return this.addSocketListener("connect", callback)
  }

  onSocketDisconnect(callback: SocketEventCallbacks["disconnect"]): () => void {
    return this.addSocketListener("disconnect", callback)
  }

  // Listener Management
  private addSocketListener<T extends keyof SocketEventCallbacks>(
    event: T,
    callback: SocketEventCallbacks[T],
  ): () => void {
    const listener = (data: any) => {
      if (data === undefined) {
        console.warn(`[ApiService] Received undefined data for event: ${event}`)
        return
      }

      // Explicitly map event types to their expected data structures
      const eventDataMap: Partial<Record<keyof SocketEventCallbacks, any>> = {
        "message:created": data as Message,
        "message:reaction": data as MessageReaction,
        "message:deleted": data as { messageId: string; eventId: string },
        "message:edited": data as Message,
        "user:joined": data as { eventId: string; user: User },
        "user:left": data as { eventId: string; userId: string },
      }

      if (event in eventDataMap) {
        callback(eventDataMap[event] as Parameters<SocketEventCallbacks[T]>[0])
      } else {
        console.warn(`[ApiService] Unhandled event type: ${event}`)
      }
    }

    const listeners = this.socketListeners.get(event) || []
    if (!listeners.includes(listener)) {
      listeners.push(listener)
      this.socketListeners.set(event, listeners)
      this.socket?.on(event, listener as (...args: any[]) => void)
    }
    return () => this.removeSocketListener(event, listener)
  }

  private removeSocketListener(event: string, callback: (...args: any[]) => void): void {
    const listeners = this.socketListeners.get(event) || []
    const filteredListeners = listeners.filter((listener) => listener !== callback)
    this.socketListeners.set(event, filteredListeners)
    this.socket?.off(event, callback)
  }

  // ==================== TASK MANAGEMENT ====================
  async inviteUserToTask(eventId: string, dto: CreateTaskDto): Promise<Task> {
    const result = await this.request<Task>(`/tasks/${eventId}/invite`, {
      method: "POST",
      body: JSON.stringify(dto),
    })
    await this.invalidateCache("/tasks")
    return result
  }

  async respondToTask(taskId: string, response: TaskStatus): Promise<Task> {
    const result = await this.request<Task>(`/tasks/${taskId}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ response }),
    })
    await this.invalidateCache("/tasks")
    return result
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const result = await this.request<Task>(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
    await this.invalidateCache("/tasks")
    return result
  }

  async getAllTasks(): Promise<Task[]> {
    return this.request<Task[]>("/tasks", { method: "GET" }, false, 30000)
  }

  async getMyTasks(): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/user/me`, { method: "GET" }, false, 30000)
  }

  async getTasksForEvent(eventId: string): Promise<Task[]> {
    return this.request<Task[]>(`/tasks/event/${eventId}`, { method: "GET" }, false, 30000)
  }

  // ==================== EVENT COST CALCULATOR ====================
  async addEventCostItem(eventId: string, data: { label: string; price: number; quantity: number }): Promise<CostItem> {
    const result = await this.request<CostItem>(`/events/${eventId}/costs`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    await this.invalidateCache(`/events/${eventId}/costs`)
    return result
  }

  async getEventCostItems(eventId: string): Promise<CostItem[]> {
    return this.request<CostItem[]>(`/events/${eventId}/costs`, { method: "GET" }, false, 30000)
  }

  async getEventCostTotal(eventId: string): Promise<{ total: number; budget?: number; withinBudget: boolean }> {
    return this.request(`/events/${eventId}/costs/total`, { method: "GET" }, false, 30000)
  }

  async updateEventCostItem(
    eventId: string,
    itemId: string,
    data: { label?: string; price?: number; quantity?: number },
  ): Promise<CostItem> {
    const result = await this.request<CostItem>(`/events/${eventId}/costs/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
    await this.invalidateCache(`/events/${eventId}/costs`)
    return result
  }

  async removeEventCostItem(eventId: string, itemId: string): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>(`/events/${eventId}/costs/${itemId}`, { method: "DELETE" })

    await this.invalidateCache(`/events/${eventId}/costs`)
    return result
  }

  async importEventCostItems(eventId: string, file: File): Promise<CostItem[]> {
    const formData = new FormData()
    formData.append("file", file)
    const result = await this.request<CostItem[]>(
      `/events/${eventId}/costs/import`,
      {
        method: "POST",
        body: formData,
      },
      true,
    )
    await this.invalidateCache(`/events/${eventId}/costs`)
    return result
  }

  // ==================== NOTIFICATIONS ====================
  async getUserNotifications(limit = 20, offset = 0): Promise<PaginatedResponse<Notification>> {
    return this.request<PaginatedResponse<Notification>>(
      `/notifications?limit=${limit}&offset=${offset}`,
      { method: "GET" },
      false,
      10000,
    )
  }

  async getUnreadNotificationCount(): Promise<number> {
    const res = await this.request<{ unreadCount: number }>(
      "/notifications/unread-count",
      { method: "GET" },
      false,
      10000,
    )
    return res.unreadCount ?? 0
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const res = await this.request<Notification>(`/notifications/${id}/read`, { method: "POST" }, false)
    await this.invalidateCache("/notifications")
    return res
  }

  async markAllNotificationsAsRead(): Promise<{ updated: number }> {
    const res = await this.request<{ updated: number }>("/notifications/read-all", { method: "POST" }, false)
    await this.invalidateCache("/notifications")
    return res
  }

  async sendNotification(dto: SendNotificationDto): Promise<{ success: boolean; recipients: number }> {
    const res = await this.request<{ success: boolean; recipients: number }>(
      "/notifications/send",
      {
        method: "POST",
        body: JSON.stringify(dto),
      },
      false,
    )
    await this.invalidateCache("/notifications")
    return res
  }

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const res = await this.request<{ success: boolean; message: string }>(
      `/notifications/${id}`,
      { method: "DELETE" },
      false,
    )
    await this.invalidateCache("/notifications")
    return res
  }

  // ==================== CLEANUP ====================
  abortAllRequests(): void {
    this.activeRequests.forEach((controller) => controller.abort())
    this.activeRequests.clear()
    this.pendingRequests.clear()
  }



async managersList(search?: string): Promise<User[]> {
  // Construct query string if search is provided
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  
  return await this.request(`/users/managers${query}`, { method: 'GET' }, false, 60000);
}

  async getFeedback(eventId: string) {
    const response = this.request(`/feedback/event/${eventId}` , { method: "GET" }, false, 30000)
    if (!response) {
      throw new Error("Failed to fetch feedback")
    }
    return response
  }

}
export const apiService = new ApiService()

