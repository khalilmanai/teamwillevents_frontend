import { EventStatus } from "@/lib/event-status";

interface Event {
  id: string;
  title: string;
  status: string;
  maxCapacity: number | null;
  participants: Array<any>;
  category: string;
}

interface EventStats {
  publishedEventsCount: number;
  draftEventsCount: number;
  totalParticipants: number;
  totalMaxParticipants: number;
  participationRate: number;
  averageParticipants: number;
  topEvent: { id: string; title: string; fillRate: number; participants: number };
  eventFillRates: { id: string; title: string; fillRate: number; participants: number }[];
  categoryBreakdown: {
    [category: string]: {
      eventsCount: number;
      totalParticipants: number;
      totalMaxCapacity: number;
      participationRate: number;
    };
  };
}

export function calculateEventStats(events: Event[]): EventStats {
  const publishedEvents = events.filter(event => event.status === EventStatus.PUBLISHED);
  const draftEvents = events.filter(event => event.status === EventStatus.PENDING);

  const totalParticipants = publishedEvents.reduce((sum, event) => {
    const participants = event.participants ? event.participants.length : 0;
    return sum + participants;
  }, 0);

  const totalMaxParticipants = publishedEvents.reduce((sum, event) => {
    return sum + (event.maxCapacity || 0);
  }, 0);

  const participationRate =
    publishedEvents.length > 0 && totalMaxParticipants > 0
      ? Math.round((totalParticipants / totalMaxParticipants) * 100)
      : 0;

  const averageParticipants =
    publishedEvents.length > 0
      ? Math.round(totalParticipants / publishedEvents.length)
      : 0;

  const eventFillRates = publishedEvents.map(event => {
    const participants = event.participants ? event.participants.length : 0;
    const max = event.maxCapacity || 0;
    const fillRate = max > 0 ? Math.round((participants / max) * 100) : 0;
    return {
      id: event.id,
      title: event.title,
      fillRate,
      participants
    };
  });

  const topEvent = eventFillRates.reduce((maxEvent, currentEvent) =>
    currentEvent.participants > maxEvent.participants ? currentEvent : maxEvent,
    { id: '', title: '', fillRate: 0, participants: 0 }
  );

  // ✅ Category Breakdown
  const categoryBreakdown = publishedEvents.reduce((acc, event) => {
    const category = event.category || 'UNCATEGORIZED';
    if (!acc[category]) {
      acc[category] = {
        eventsCount: 0,
        totalParticipants: 0,
        totalMaxCapacity: 0,
        participationRate: 0
      };
    }

    const participants = event.participants ? event.participants.length : 0;
    const max = event.maxCapacity || 0;

    acc[category].eventsCount += 1;
    acc[category].totalParticipants += participants;
    acc[category].totalMaxCapacity += max;

    return acc;
  }, {} as EventStats['categoryBreakdown']);

  // Compute participation rate for each category
  for (const category in categoryBreakdown) {
    const data = categoryBreakdown[category];
    data.participationRate =
      data.totalMaxCapacity > 0
        ? Math.round((data.totalParticipants / data.totalMaxCapacity) * 100)
        : 0;
  }

  return {
    publishedEventsCount: publishedEvents.length,
    draftEventsCount: draftEvents.length,
    totalParticipants,
    totalMaxParticipants,
    participationRate,
    averageParticipants,
    topEvent,
    eventFillRates,
    categoryBreakdown
  };
}
