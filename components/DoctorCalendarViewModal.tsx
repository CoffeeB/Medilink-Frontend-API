// components/DoctorCalendarView.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import "@/components/DoctorCalendarView/styles.css";
import { Button } from "./ui/button";

// interface EventData {
//   id: string;
//   clientName: string;
//   sex: string;
//   date: string;
//   time: string;
//   address: string;
//   signature?: string;
// }

// interface DoctorCalendarViewProps {
//   selectedEvent: EventData[];
//   setSelectedEvent: any;
// }

export default function DoctorCalendarViewModal({ selectedEvent, setSelectedEvent }: any) {
  return (
    <>
      {/* Modal for details */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent?.clientName}</DialogTitle>
                <DialogDescription>Appointment details</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <p>
                  <strong>Date:</strong> {selectedEvent?.date}
                </p>
                <p>
                  <strong>Time:</strong> {selectedEvent?.time}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent?.address}
                </p>
                {/* {selectedEvent?.sex && (
                  <p>
                    <strong>Sex:</strong> {selectedEvent?.sex}
                  </p>
                )} */}
                <Button className="cursor-pointer">Confirm</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
