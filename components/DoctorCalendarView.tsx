// components/DoctorCalendarView.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import "@/components/DoctorCalendarView/styles.css";
import { Button } from "./ui/button";
import DoctorCalendarViewModal from "./DoctorCalendarViewModal";

interface EventData {
  id: string;
  clientName: string;
  sex: string;
  date: string;
  time: string;
  address: string;
  signature?: string;
}

interface DoctorCalendarViewProps {
  events: EventData[];
}

export default function DoctorCalendarView({ events }: DoctorCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  return (
    <>
      <div className="w-full h-full p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "today prev,next",
            center: "title",
            right: "dayGridMonth,dayGridWeek,dayGridDay",
          }}
          events={events?.map((ev) => ({
            id: ev.id,
            name: ev.clientName,
            start: `${ev.date}T${ev.time}`, // combine date + time
          }))}
          eventClick={(info) => {
            const ev = events?.find((e) => e.id === info.event.id);
            if (ev) setSelectedEvent(ev);
          }}
          height="auto"
          contentHeight="auto"
        />
      </div>

      {/* Modal for details */}
      <DoctorCalendarViewModal selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
    </>
  );
}
