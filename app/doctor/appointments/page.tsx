"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DoctorEventList } from "@/components/DoctorEventList";
import DoctorCalendarView from "@/components/DoctorCalendarViewModal";
import { Event } from "@/types/calendar";
import { seeAllAppointments } from "@/hooks/appointments";

const ClientAppointments = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<Event[]>();

  useEffect(() => {
    const appointments = async () => {
      const doctor = true;
      const marketer = false;
      try {
        const response = await seeAllAppointments(doctor, marketer);

        console.log(response);

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
        <CardContent className='flex flex-col lg:flex-row'>
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-background">
            <DoctorEventList events={events} />
          </div>
          <div className="flex-1">
            <DoctorCalendarView events={events} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAppointments;
