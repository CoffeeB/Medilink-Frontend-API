// components/DoctorCalendarView.tsx
"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import "@/components/DoctorCalendarView/styles.css"

interface EventData {
  id: string
  clientName: string
  sex: string
  date: string
  time: string
  address: string
  signature?: string
}

interface DoctorCalendarViewProps {
  events: EventData[]
}

export default function DoctorCalendarView({ events }: DoctorCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)

  return (
    <>
    <div className='w-full h-full p-4'>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'today prev,next',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        }}
        events={events.map((ev) => ({
          id: ev.id,
          name: ev.clientName,
          start: `${ev.date}T${ev.time}`, // combine date + time
        }))}
        eventClick={(info) => {
          const ev = events.find((e) => e.id === info.event.id)
          if (ev) setSelectedEvent(ev)
        }}
        height="auto"
      />
      </div>

      {/* Modal for details */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
  <DialogContent className="max-w-md">
    {selectedEvent && (
      <>
        <DialogHeader>
          <DialogTitle>{selectedEvent.clientName}</DialogTitle>
          <DialogDescription>
            Appointment details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p><strong>Date:</strong> {selectedEvent.date}</p>
          <p><strong>Time:</strong> {selectedEvent.time}</p>
          <p><strong>Address:</strong> {selectedEvent.address}</p>
          {selectedEvent.sex && (
            <p><strong>Sex:</strong> {selectedEvent.sex}</p>
          )}
        </div>
      </>
    )}
  </DialogContent>
</Dialog>
    </>
  )
}
