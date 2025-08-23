import { Event } from '@/types/calendar.d'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DoctorEventListProps {
  events: Event[]
}

export function DoctorEventList({ events }: DoctorEventListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b">
        <h2 className="text-base sm:text-lg font-semibold">Upcoming Appointments</h2>
      </div>
      <ScrollArea className="flex-1 px-3 sm:px-4 lg:px-6">
        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">You are going to</h3>
          {events.map((event) => (
            <div key={event.id} className="flex items-start space-x-3 sm:space-x-4">
              <Avatar className="mt-1">
                <div className={`w-full h-full bg-[#ff9e58]`}/>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-medium leading-none">{event.clientName}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString()} by {event.time}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{event.address}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

