"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Event } from '@/types/calendar'
import { EventList } from '@/components/EventList'
import CalendarView from '@/components/CalendarView'

const initialEvents: Event[] = [
  {
    id: "1",
    title: "Consultation with John",
    clientName: "John",
    date: "2025-08-06",
    time: "15:27",
    location: "Clinic A",
    address: "123 Street, City",
    age: "35",
    sex: "male",
    type: "client-meeting",
    signature: "",
  },
  {
    id: "2",
    title: "Consultation with Doe",
    clientName: "Doe",
    date: "2025-08-20",
    time: "15:27",
    location: "Clinic A",
    address: "123 Street, City",
    age: "28",
    sex: "male",
    type: "client-meeting",
    signature: "",
  },
  {
    id: "3",
    title: "Follow-up with Jane",
    clientName: "Jane",
    date: "2025-08-06",
    time: "15:27",
    location: "Clinic A",
    address: "123 Street, City",
    age: "32",
    sex: "female",
    type: "client-meeting",
    signature: "",
  },
]

const ClientAppointments = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents)

  const handleAddEvent = (newEvent: Event) => {
    setEvents((prev) => [...prev, newEvent])
  }

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prev) => prev.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev))
  }

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter(ev => ev.id !== id))
  }

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardContent className='flex flex-col lg:flex-row'>
          {/* Sidebar */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-background">
            <EventList events={events} />
          </div>

          {/* Calendar */}
          <div className="flex-1">
            <CalendarView 
              events={events}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent} 
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientAppointments