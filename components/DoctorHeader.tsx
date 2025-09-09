"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
// import { usePathname } from 'next/navigation'
import { Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Cookies from "js-cookie";
import { Bell } from "lucide-react";
import { seeAllPendingForms, seeFormDetails } from "@/hooks/form";
import { seeAllNotifications } from "@/hooks/notifications";
import DoctorCalendarView from "./DoctorCalendarView";
import DoctorCalendarViewModal from "./DoctorCalendarViewModal";
import { useRouter } from "next/navigation";

const DoctorHeader = () => {
  // const pathname = usePathname()
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = async (notification: any) => {
    if (notification.link) {
      try {
        const response = await seeFormDetails(notification.link);
        setSelectedEvent(response);
        setIsModalOpen(true);
      } catch (error) {
        console.log(error);
      }
    }
    setSelectedNotification(notification);
  };

  const isActive = (path: string) => {
    return typeof window !== "undefined" && window.location.pathname === path;
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
  };

  // const isActive = (path: string) => pathname === path
  useEffect(() => {
    const fetchNotifications = async () => {
      const doctor = false;
      const marketer = true;

      try {
        const response = await seeAllNotifications();
        setNotifications(response);
      } catch (error: any) {
        console.error(error);
      }
    };

    // Call once immediately
    fetchNotifications();

    // Then set up polling
    const interval = setInterval(fetchNotifications, 10000); // every 60s

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token")  
      // Redirect to login pag
     router.push("/doctor/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-[1350px]">
        <div className="flex items-center justify-between h-[80px] px-6 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Image src="/images/logo.svg" alt="Excel Connect logo" width={250} height={32} priority />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-9">
            {/* <Link className={`hover:text-primary ${isActive('/doctor/dashboard') ? 'text-primary' : ''}`} href="/doctor/dashboard">Home</Link> */}
            <Link className={`hover:text-primary ${isActive("/doctor/appointments") ? "text-primary" : ""}`} href="/doctor/appointments">
              Appointments
            </Link>
            <Link className={`hover:text-primary ${isActive("/doctor/messaging") ? "text-primary" : ""}`} href="/doctor/messages">
              Messaging
            </Link>
            <Link className={`hover:text-primary ${isActive("/doctor/client") ? "text-primary" : ""}`} href="/doctor/client">
              Client
            </Link>
          </nav>

          {/* Right Side - Profile */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-primary hover:text-primary" variant="ghost" size="icon">
                  <Bell className="h-6 w-6 cursor-pointer" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="h-70 overflow-y-auto bg-white shadow-md rounded" align="end" forceMount>
                {notifications?.length > 0 ? (
                  notifications?.map((n, idx) => (
                    <DropdownMenuItem key={idx} className="cursor-pointer hover:bg-black/5 rounded-md border-b border-black/10" onClick={() => handleItemClick(n)}>
                      {n?.message}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-secondary hover:bg-secondary text-white hover:text-white cursor-pointer">
                  MI
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <DropdownMenuSeparator />
                <Link href="/doctor/profile">
                  <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href="/doctor/login" onClick={logout}>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={handleLogout}
                    >Log out</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden bg-white border-t flex flex-col space-y-2 px-6 py-4">
            <Link onClick={() => setMobileOpen(false)} href="/doctor/appointments" className={`hover:text-primary ${isActive("/doctor/appointments") ? "text-primary" : ""}`}>
              Appointments
            </Link>
            <Link onClick={() => setMobileOpen(false)} href="/doctor/messages" className={`hover:text-primary ${isActive("/doctor/messages") ? "text-primary" : ""}`}>
              Messaging
            </Link>

            <Link onClick={() => setMobileOpen(false)} href="/doctor/client" className={`hover:text-primary ${isActive("/doctor/client") ? "text-primary" : ""}`}>
              Client
            </Link>
          </nav>
        )}

        {selectedEvent && (
          <>
            <DoctorCalendarViewModal selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} />
          </>
        )}
      </div>
    </header>
  );
};

export default DoctorHeader;
