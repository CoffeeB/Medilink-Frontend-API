"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Event } from "@/types/calendar";
import { EventList } from "@/components/EventList";
import CalendarView from "@/components/CalendarView";
import { newAppointment, seeAllAppointments } from "@/hooks/appointments";

const ClientAppointments = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddEvent = async (newEvent: Event) => {
    setEvents((prev) => (Array.isArray(prev) ? [...prev, newEvent] : [newEvent]));
    try {
      const response = await newAppointment(newEvent);
    } catch (error) {
      console.log("Error:- ",error);
      
    }
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prev) => prev.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev)));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  useEffect(() => {
    const appointments = async () => {
      const doctor = false;
      const marketer = true;
      try {
        const response = await seeAllAppointments(doctor, marketer);

        setEvents(response.data);
      } catch (error: any) {
        console.log(error);
        setError(error.response?.data?.error || "Failed to fetch appointments. Please try again.");
      }
    };

    appointments();
  }, []);

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardContent className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-background">
            <EventList events={events} />
          </div>

          {/* Calendar */}
          <div className="flex-1">
            <CalendarView events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAppointments;
