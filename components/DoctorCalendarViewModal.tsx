// components/DoctorCalendarView.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import "@/components/DoctorCalendarView/styles.css";
import { Button } from "./ui/button";
import { confirmAppointment } from "@/hooks/appointments";

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
  const handleConfirmAppointment = async () => {
    try {
      const response = await confirmAppointment(selectedEvent?._id);
      setSelectedEvent(null);
    } catch (error) {
      console.log(error);
    }
  };

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
                  <strong>Date:</strong> {selectedEvent?.preferredDate}
                </p>
                <p>
                  <strong>Time:</strong> {selectedEvent?.preferredTime}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent?.description}
                </p>
                {/* {selectedEvent?.sex && (
                  <p>
                    <strong>Sex:</strong> {selectedEvent?.sex}
                  </p>
                )} */}
                {selectedEvent.status != "accepted" && (
                  <Button onClick={handleConfirmAppointment} className="cursor-pointer">
                    Confirm
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
