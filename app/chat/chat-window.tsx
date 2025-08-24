"use client";
import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Send, Trash2, Reply, MoreVertical, Loader2, ImageIcon, File, Edit, Check, X, Heart, MessageSquare, Users } from 'lucide-react';
import EmojiPicker from "emoji-picker-react";
import { Progress } from "@/components/ui/progress";
import type { Message, User } from "@/lib/types";
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useChatConfig } from "./chat-config";

// Debug logger with component name prefix
const debug = {
  log: (message: string, data?: any) => console.log(`[ChatWindow] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ChatWindow] ${message}`, error),
  warn: (message: string, data?: any) => console.warn(`[ChatWindow] ${message}`, data),
};

interface ChatWindowProps {
  eventId: string;
}

// Memoized message component to prevent unnecessary re-renders
const MemoizedMessage = React.memo(({
  message,
  isOwnMessage,
  currentUser,
  participants,
  editMessageId,
  editContent,
  setEditContent,
  startEditing,
  cancelEditing,
  saveEdit,
  handleReact,
  setSelectedMessage,
  handleDelete,
  formatTime,
}: {
  message: Message;
  isOwnMessage: boolean;
  currentUser: User | null;
  participants: User[];
  editMessageId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  startEditing: (message: Message) => void;
  cancelEditing: () => void;
  saveEdit: () => void;
  handleReact: (messageId: string, emoji: string) => void;
  setSelectedMessage: (message: Message | null) => void;
  handleDelete: (messageId: string) => void;
  formatTime: (dateString: string) => string;
}) => {
  const sender = message.sender || participants.find(p => p.id === message.senderId);
  const displaySenderName = !isOwnMessage && sender?.name || sender?.username;

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-[85%] p-3 rounded-xl relative ${
          isOwnMessage
            ? "bg-emerald-600 text-white rounded-br-sm" // Own message: green, with a slight tail on bottom-right
            : "bg-gray-100 text-gray-800 rounded-bl-sm" // Other message: light gray, with a slight tail on bottom-left
        } ${message.pending ? "opacity-70" : ""} shadow-sm`}
      >
        {!isOwnMessage && (
          <div className="font-semibold text-sm mb-1 flex items-center gap-2">
            <img
              src={sender?.avatarUrl || "/placeholder.svg?height=24&width=24"}
              alt={sender?.username || "User"}
              className="w-6 h-6 rounded-full border-2 border-emerald-200"
            />
            {displaySenderName}
          </div>
        )}
        {message.replyTo && (
          <div className="text-xs opacity-80 mb-2 p-2 bg-black/5 rounded-md border border-black/10">
            <Reply className="w-3 h-3 inline mr-1 text-gray-600" aria-hidden="true" />
            <span className="font-medium">Replying to {message.replyTo.sender?.username || "User"}:</span>{" "}
            {message.replyTo.content?.substring(0, 50)}{message.replyTo.content && message.replyTo.content.length > 50 ? "..." : ""}
          </div>
        )}
        <div className="text-sm break-words">
          {message.type === "MEDIA" && message.mediaUrl ? (
            message.mediaUrl.includes(".mp4") ? (
              <video src={message.mediaUrl} controls className="max-w-full rounded-lg" />
            ) : (
              <img src={message.mediaUrl || "/placeholder.svg"} alt="Media" className="max-w-full rounded-lg" />
            )
          ) : message.type === "FILE" && message.mediaUrl ? (
            <a href={message.mediaUrl} download className="text-emerald-500 underline flex items-center gap-1">
              <File className="w-4 h-4" /> Download File
            </a>
          ) : editMessageId === message.id ? (
            <div className="flex gap-2 items-center">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 bg-white text-gray-800 border-gray-300 focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEditing();
                }}
                aria-label="Edit message"
              />
              <Button size="sm" onClick={saveEdit} aria-label="Save edit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEditing} aria-label="Cancel edit" className="border-gray-300 text-gray-700 hover:bg-gray-200">
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              {message.content}
              {message.edited && <span className="text-xs opacity-70 ml-1">(edited)</span>}
              {message.pending && <Loader2 className="w-3 h-3 inline ml-2 animate-spin" />}
            </>
          )}
        </div>
        <div className="text-xs mt-1 opacity-80 flex items-center gap-2 justify-end">
          {formatTime(message.createdAt)}
          {message.reactions && message.reactions.length > 0 && (
            <span className="ml-2 flex gap-1">
              {message.reactions.map((r: any, i: number) => (
                <span
                  key={i}
                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs ${isOwnMessage ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"}`}
                >
                  {r.emoji} {participants.find((p) => p.id === r.userId)?.username || "User"}
                </span>
              ))}
            </span>
          )}
        </div>
        {!message.pending && editMessageId !== message.id && (
          <div className={`flex gap-1 mt-2 absolute ${isOwnMessage ? '-left-12' : '-right-12'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
            <Button
              onClick={() => handleReact(message.id, "❤️")}
              className={`p-1 rounded-full ${isOwnMessage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
              size="icon"
              aria-label="React with heart"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setSelectedMessage(message)}
              className={`p-1 rounded-full ${isOwnMessage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
              size="icon"
              aria-label="Reply to message"
            >
              <Reply className="w-4 h-4" />
            </Button>
            {isOwnMessage && (
              <>
                <Button
                  onClick={() => startEditing(message)}
                  className={`p-1 rounded-full ${isOwnMessage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                  size="icon"
                  aria-label="Edit message"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(message.id)}
                  className={`p-1 rounded-full ${isOwnMessage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
                  size="icon"
                  aria-label="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.content === nextProps.message.content &&
         prevProps.message.reactions?.length === nextProps.message.reactions?.length &&
         prevProps.editMessageId === nextProps.editMessageId &&
         prevProps.editContent === nextProps.editContent &&
         prevProps.message.pending === nextProps.message.pending; // Added pending status to memoization check
});

export default function ChatWindow({ eventId }: ChatWindowProps) {
  const listRef = useRef<List>(null);
  const {
    messages,
    newMessage,
    setNewMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    selectedMessage,
    setSelectedMessage,
    currentUser,
    sending,
    isEditing,
    editMessageId,
    editContent,
    setEditContent,
    mediaUploads,
    eventInfo,
    participants,
    connectionStatus,
    messagesEndRef,
    inputRef,
    fileInputRef,
    chatContainerRef,
    emojiPickerRef,
    isLoading,
    isOwnMessage,
    formatTime,
    getConnectionStatusColor,
    handleSendMessage,
    handleReact,
    handleDelete,
    startEditing,
    cancelEditing,
    saveEdit,
    handleFileChange,
    removeUpload,
    getItemSize
  } = useChatConfig({ eventId });

  // Auto-scroll for virtualized list
  useEffect(() => {
    listRef.current?.scrollToItem(messages.length - 1, "end");
  }, [messages]);

  if (isLoading) {
    return (
      <Card className="flex flex-col h-[700px] max-w-md mx-auto shadow-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md">
          <h2 className="text-xl font-bold">Event Chat</h2>
          <p className="text-emerald-100 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="flex flex-col h-[700px] max-w-md mx-auto shadow-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50"
      role="log"
      aria-live="polite"
    >
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 px-6 py-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{eventInfo?.title || "Event Chat"}</h2>
            <p className="text-emerald-100 text-sm">
              {eventInfo?.date} at {eventInfo?.time}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs">
                {participants.length} participants
              </span>
              <div className="flex -space-x-2 ml-2">
                {participants.slice(0, 5).map((p) => (
                  <img
                    key={p.id}
                    src={p.avatarUrl || "/placeholder.svg?height=24&width=24"}
                    alt={p.username}
                    className="w-6 h-6 rounded-full border-2 border-white"
                  />
                ))}
                {participants.length > 5 && (
                  <span className="text-xs bg-white/20 rounded-full px-2 py-1">+{participants.length - 5}</span>
                )}
              </div>
              <div
                className={`w-2 h-2 rounded-full ${getConnectionStatusColor()}`}
                title={`Connection: ${connectionStatus}`}
                aria-label={`Connection status: ${connectionStatus}`}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" aria-label="More options">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4"> {/* Added space-y-4 for message spacing */}
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2" aria-hidden="true" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef}
                height={height}
                itemCount={messages.length}
                itemSize={getItemSize}
                width={width}
              >
                {({ index, style }) => (
                  <div style={style} className="px-2 py-1"> {/* Adjusted padding for virtualized items */}
                    <MemoizedMessage
                      message={messages[index]}
                      isOwnMessage={isOwnMessage(messages[index])}
                      currentUser={currentUser}
                      participants={participants}
                      editMessageId={editMessageId}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      startEditing={startEditing}
                      cancelEditing={cancelEditing}
                      saveEdit={saveEdit}
                      handleReact={handleReact}
                      setSelectedMessage={setSelectedMessage}
                      handleDelete={handleDelete}
                      formatTime={formatTime}
                    />
                  </div>
                )}
              </List>
            )}
          </AutoSizer>
        )}
        <div ref={messagesEndRef} />
      </div>
      {mediaUploads.length > 0 && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex gap-2 overflow-x-auto">
          {mediaUploads.map((upload, index) => (
            <div key={index} className="relative flex-shrink-0">
              {upload.preview ? (
                <img
                  src={upload.preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-16 h-16 rounded object-cover border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                  <File className="w-6 h-6 text-gray-400" aria-hidden="true" />
                </div>
              )}
              {upload.progress > 0 && <Progress value={upload.progress} className="absolute bottom-0 h-1 w-full" />}
              <button
                onClick={() => removeUpload(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                aria-label="Remove upload"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedMessage && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-700 font-medium">
              Replying to {selectedMessage.sender?.name || selectedMessage.sender?.username}
            </p>
            <p className="text-sm truncate">{selectedMessage.content}</p>
          </div>
          <button
            onClick={() => setSelectedMessage(null)}
            className="ml-2 p-1 hover:bg-emerald-200 rounded-full text-gray-600 hover:text-gray-800"
            aria-label="Cancel reply"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="p-4 bg-white border-t border-gray-200 relative">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full"
            aria-label="Open emoji picker"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full"
            aria-label="Upload file"
          >
            <ImageIcon className="w-5 h-5" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip" // Expanded file types
              multiple
            />
          </button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 h-10 pr-10" // Added pr-10 for potential future icon inside input
            aria-label="Type a message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={sending || (!newMessage.trim() && mediaUploads.length === 0)}
            aria-label="Send message"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2"
            size="icon"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-20 left-4 right-4 z-50 shadow-lg rounded-lg overflow-hidden">
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setNewMessage((prev) => prev + emoji.emoji);
                setShowEmojiPicker(false);
                inputRef.current?.focus();
              }}
              width="100%"
              height={350}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
