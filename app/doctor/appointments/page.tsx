import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DoctorEventList } from '@/components/DoctorEventList'
import DoctorCalendarView from '@/components/DoctorCalendarViewModal'
import { Event } from '@/types/calendar'

const mockEvents : Event[] = [
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
  return (
    <div className="container max-w-[1350px] mx-auto p-6 space-y-6">
      <Card>
        <CardContent className='flex'>
          <div className="w-80 border-r bg-background">
            <DoctorEventList events={mockEvents} />
          </div>
          <div className="flex-1">
            <DoctorCalendarView events={mockEvents} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientAppointments