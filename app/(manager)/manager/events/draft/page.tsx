"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Send, 
  Calendar,
  Clock,
  Search,
  Filter,
  MapPin,
  Users,
  MoreHorizontal,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Event } from "@/lib/types";
import { apiService } from "@/lib/api";
import { EventStatus } from "@/lib/event-status";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

interface EventCardProps {
  event: Event;
  index: number;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

function EventCard({ event, index, onEdit, onPublish, onDelete, onClick }: EventCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      variants={itemVariants}
      className="cursor-pointer group"
      onClick={() => onClick(event.id)}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                <Sparkles className="h-3 w-3 mr-1" />
                Draft
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onEdit(event.id))}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onPublish(event.id))}>
                    <Send className="h-4 w-4 mr-2" />
                    Publish Event
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => handleActionClick(e, () => onDelete(event.id))}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Created {formatDate(event.createdAt)}</span>
            </div>

            {event.startDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Starts {formatDate(event.startDate)}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.attendeesCount && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.attendeesCount} expected attendees</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <Button
              size="sm"
              onClick={(e) => handleActionClick(e, () => onEdit(event.id))}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button 
              size="sm"
              variant="outline"
              onClick={(e) => handleActionClick(e, () => onPublish(event.id))}
            >
              <Send className="h-4 w-4 mr-1" />
              Publish
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchDrafts() {
      try {
        setLoading(true);
        const events = await apiService.getEventsByStatus(EventStatus.PENDING);
        setDrafts(events);
      } catch (error) {
        console.error("Failed to fetch draft events", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDrafts();
  }, []);

  const filteredDrafts = drafts.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCardClick = useCallback((eventId: string) => {
    router.push(`/manager/events/${eventId}`);
  }, [router]);

  const handleEdit = useCallback((eventId: string) => {
    router.push(`/manager/events/${eventId}`);
  }, [router]);

  const handlePublish = useCallback(async (eventId: string) => {
    try {
      await apiService.updateEventStatus(eventId, EventStatus.PUBLISHED);
      setDrafts(drafts.filter(event => event.id !== eventId));
    } catch (error) {
      console.error("Failed to publish event", error);
    }
  }, [drafts]);

  const handleDelete = useCallback(async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await apiService.deleteEvent(eventId);
        setDrafts(drafts.filter(event => event.id !== eventId));
      } catch (error) {
        console.error("Failed to delete event", error);
      }
    }
  }, [drafts]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Draft Events
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your unpublished events • 
              <span className="font-medium ml-1">
                {drafts.length} total drafts
              </span>
            </p>
          </div>

          <Button 
            size="lg"
            onClick={() => router.push("/manager/events/create")}
            className="shrink-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Event
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search draft events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredDrafts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No matching drafts found' : 'No draft events yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or create a new event to get started.'
                  : 'Create your first event draft to begin organizing your upcoming events.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  size="lg"
                  onClick={() => router.push("/manager/events/create")}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Event
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDrafts.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  onClick={handleCardClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}