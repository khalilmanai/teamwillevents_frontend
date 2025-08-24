// Accepts time as 'HH:mm:ss' or 'HH:mm', returns formatted time or empty string if invalid
export function formatTime(time: string): string {
  if (!time) return ""
  // Validate time format (basic check)
  const valid = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)
  if (!valid) return ""
  // Use today's date to avoid timezone issues
  const today = new Date()
  const [h, m, s] = time.split(":")
  const dateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate(), Number(h), Number(m), Number(s) || 0)
  if (isNaN(dateObj.getTime())) return ""
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTimeString(dateTimeStr: string): string {
  // Expects format: 'YYYY-MM-DD HH:mm:ss'
  if (!dateTimeStr) return ""
  const [date, time] = dateTimeStr.split(" ")
  if (!date || !time) return ""
  const dateObj = new Date(`${date}T${time}`)
  if (isNaN(dateObj.getTime())) return ""
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}


export const formatTND = (amount: number): string => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(amount);
};
// Accepts date: 'YYYY-MM-DD', time: 'HH:mm:ss' or 'HH:mm', returns formatted string or empty if invalid
export function formatDateTime(date: string, time: string): string {
  if (!date || !time) return ""
  // Compose a string like 'YYYY-MM-DD HH:mm:ss' or 'YYYY-MM-DD HH:mm'
  const dateTimeStr = `${date} ${time}`
  // Convert to ISO string for Date parsing
  const isoStr = dateTimeStr.replace(" ", "T")
  const dateTime = new Date(isoStr)
  if (isNaN(dateTime.getTime())) return ""
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateTime)
}

export function isEventUpcoming(date: string, time: string): boolean {
  if (!date || !time) return false
  const dateTimeStr = `${date} ${time}`
  const isoStr = dateTimeStr.replace(" ", "T")
  const eventDateTime = new Date(isoStr)
  return eventDateTime > new Date()
}

// Expects event.date: 'YYYY-MM-DD', event.time: 'HH:mm:ss' or 'HH:mm'
export function getEventStatus(event: { date: string; time: string }): "upcoming" | "ongoing" | "past" {
  const now = new Date()
  if (!event.date || !event.time) return "past"
  const dateTimeStr = `${event.date} ${event.time}`
  const isoStr = dateTimeStr.replace(" ", "T")
  const eventStart = new Date(isoStr)
  const eventEnd = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000) // Assume 2h duration

  if (now < eventStart) return "upcoming"
  if (now >= eventStart && now <= eventEnd) return "ongoing"
  return "past"
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function generateEventSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}