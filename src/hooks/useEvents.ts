import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api";
import { Event } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Define the event data type for creating/updating events
type EventData = {
  title: string;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  notes: string;
};

export const useEvents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const userId = user?.id;

  const eventsQuery = useQuery({
    queryKey: ["events", userId],
    queryFn: async () => {
      if (!userId) return [];
      const data = await getEvents(userId);
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  const createEventMutation = useMutation({
    mutationFn: (data: EventData) => {
      if (!userId) throw new Error("User not authenticated");
      return createEvent(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", userId] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventData }) => {
      if (!userId) throw new Error("User not authenticated");
      return updateEvent(userId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", userId] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => {
      if (!userId) throw new Error("User not authenticated");
      return deleteEvent(userId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", userId] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
  };
}; 