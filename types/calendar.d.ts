export interface Event {
  id: string
  title: string
  clientName: string
  date: string
  time: string
  location: string
  address: string
  image?: string
  age: string
  sex: 'male' | 'female'
  signature?: string
  type: 'client-meeting' | 'festival' | 'staff-meeting' | 'general-meeting'
}

export interface CalendarEvent extends Event {
  start: Date
  end: Date
}

