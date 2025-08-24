import { useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/lib/api"; // your API service class instance
import type { Message, User, Event } from "@/lib/types";

interface MediaUpload {
  file: File;
  preview?: string;
  progress: number;
}

export function useChatConfig({ eventId }: { eventId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [eventInfo, setEventInfo] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const [mediaUploads, setMediaUploads] = useState<MediaUpload[]>([]);

  // refs for DOM elements used in UI
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null); // react-window list ref

  // Fetch initial event info, participants, current user, messages
  useEffect(() => {
    let canceled = false;
    async function fetchInitialData() {
      try {
        setIsLoading(true);

        // Assume apiService has these methods:
        const [eventDetails, users, currentUserData, initialMessages] = await Promise.all([
          apiService.getEvent(eventId),
          apiService.getEventParticipants(eventId),
          apiService.getCurrentUser(),
          apiService.getMessages(eventId, 1, 50), // get first 50 messages
        ]);

        if (canceled) return;

        setEventInfo(eventDetails);
        setParticipants(users);
        setCurrentUser(currentUserData);
        setMessages(initialMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));

        setIsLoading(false);
      } catch (error) {
        console.error("[useChatConfig] Failed initial fetch:", error);
        if (!canceled) setIsLoading(false);
      }
    }
    fetchInitialData();

    return () => {
      canceled = true;
    };
  }, [eventId]);

  // Socket connection + event listeners + room join
  useEffect(() => {
    if (isLoading) return;

    let isMounted = true;

    async function setupSocket() {
      try {
        const socket = await apiService.connectSocket();

        // Update connection status UI
        const updateStatus = (status: string) => isMounted && setConnectionStatus(status);
        updateStatus("connected");

        socket.on("disconnect", () => updateStatus("disconnected"));
        socket.on("connect_error", () => updateStatus("error"));

        // Join room for this event
        await apiService.joinEventRoom(eventId);

        // Listen for real-time events:
        socket.on("message:created", (msg: Message) => {
          if (!isMounted) return;

          setMessages((prev) => {
            // Avoid duplicate messages (replace tempId with server id)
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });
        });

        socket.on("message:edited", (msg: Message) => {
          if (!isMounted) return;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        });

        socket.on("message:deleted", ({ messageId }: { messageId: string }) => {
          if (!isMounted) return;
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        });

        socket.on("message:reaction", (reaction: { messageId: string; emoji: string; userId: string }) => {
          if (!isMounted) return;
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== reaction.messageId) return msg;

              const reactions = msg.reactions || [];
              // Add reaction if not present
              if (!reactions.find((r) => r.emoji === reaction.emoji && r.userId === reaction.userId)) {
                return { ...msg, reactions: [...reactions, reaction] };
              }
              return msg;
            })
          );
        });

        socket.on("user:joined", (data) => {
          // optionally handle user joined event
        });

        socket.on("user:left", (data) => {
          // optionally handle user left event
        });
      } catch (error) {
        console.error("[useChatConfig] Socket setup error:", error);
        if (isMounted) setConnectionStatus("error");
      }
    }

    setupSocket();

    return () => {
      isMounted = false;
      apiService.leaveEventRoom(eventId).catch(() => {});
      apiService.disconnectSocket().catch(() => {});
      setConnectionStatus("disconnected");
    };
  }, [eventId, isLoading]);

  // Message sending (text or with reply or media)
  const handleSendMessage = useCallback(async () => {
    if (sending) return;
    if (!newMessage.trim() && mediaUploads.length === 0) return;

    setSending(true);
    try {
      // Upload media first if any
      let mediaUrls: string[] = [];
      if (mediaUploads.length > 0) {
        for (const upload of mediaUploads) {
          const formData = new FormData();
          formData.append("file", upload.file);
          await apiService.uploadMedia(formData, (progress) => {
            // Update progress state for this upload
            setMediaUploads((uploads) =>
              uploads.map((u) =>
                u.file === upload.file ? { ...u, progress } : u
              )
            );
          }).then((msg) => {
            mediaUrls.push(msg.mediaUrl || "");
          });
        }
      }

      // Send messages for each media or send text message
      if (mediaUrls.length > 0) {
        // Send a message for each media url
        for (const url of mediaUrls) {
          await apiService.sendMessage({
            eventId,
            content: "",
            type: "MEDIA",
            mediaUrl: url,
            replyToId: selectedMessage?.id,
          });
        }
      }

      if (newMessage.trim()) {
        await apiService.sendMessage({
          eventId,
          content: newMessage.trim(),
          replyToId: selectedMessage?.id,
          type: "TEXT",
        });
      }

      // Clear inputs
      setNewMessage("");
      setSelectedMessage(null);
      setMediaUploads([]);
    } catch (error) {
      console.error("[useChatConfig] Send message error:", error);
    } finally {
      setSending(false);
    }
  }, [newMessage, mediaUploads, selectedMessage, sending, eventId]);

  // Handle message edit
  const startEditing = (message: Message) => {
    setEditMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditMessageId(null);
    setEditContent("");
  };

  const saveEdit = async () => {
    if (!editMessageId || !editContent.trim()) {
      cancelEditing();
      return;
    }
    try {
      await apiService.editMessage(editMessageId, editContent.trim());
      setEditMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error("[useChatConfig] Save edit error:", error);
    }
  };

  // Handle delete message
  const handleDelete = async (messageId: string) => {
    try {
      await apiService.deleteMessage(eventId, messageId);
    } catch (error) {
      console.error("[useChatConfig] Delete message error:", error);
    }
  };

  // React / unreact
  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await apiService.reactToMessage(eventId, messageId, emoji);
    } catch (error) {
      console.error("[useChatConfig] React error:", error);
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await apiService.removeReaction(eventId, messageId, emoji);
    } catch (error) {
      console.error("[useChatConfig] Remove reaction error:", error);
    }
  };

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newUploads: MediaUpload[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setMediaUploads((prev) => [...prev, ...newUploads]);
    e.target.value = ""; // reset input so same file can be selected again
  };

  const removeUpload = (index: number) => {
    setMediaUploads((prev) => {
      const copy = [...prev];
      // revoke object URL to avoid memory leaks
      if (copy[index].preview) URL.revokeObjectURL(copy[index].preview!);
      copy.splice(index, 1);
      return copy;
    });
  };

  // Format date string to readable time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Identify if a message was sent by current user
  const isOwnMessage = (message: Message): boolean => {
    return message.sender?.id === currentUser?.id;
  };

  // Connection status color (green/orange/red)
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "disconnected":
        return "bg-red-500";
      case "error":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  // Virtualized list row height calculator (estimate height for each message)
  const getItemSize = (index: number): number => {
    const msg = messages[index];
    let baseHeight = 50; // base min height

    if (msg.type === "MEDIA" && msg.mediaUrl) {
      baseHeight += 150; // image/video preview
    } else if (msg.type === "FILE") {
      baseHeight += 30;
    }

    if (msg.content) {
      // approx lines count by dividing content length
      const lines = Math.ceil(msg.content.length / 40);
      baseHeight += lines * 20;
    }

    if (msg.replyTo) {
      baseHeight += 40; // reply preview
    }

    return baseHeight;
  };

  return {
    messages,
    participants,
    eventInfo,
    currentUser,
    connectionStatus,
    sending,
    isLoading,
    newMessage,
    setNewMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    selectedMessage,
    setSelectedMessage,
    editMessageId,
    editContent,
    setEditContent,
    mediaUploads,
    messagesEndRef,
    inputRef,
    fileInputRef,
    chatContainerRef,
    emojiPickerRef,
    listRef,
    formatTime,
    isOwnMessage,
    getConnectionStatusColor,
    getItemSize,
    handleSendMessage,
    handleReact,
    handleDelete,
    startEditing,
    cancelEditing,
    saveEdit,
    handleFileChange,
    removeUpload,
  };
}
