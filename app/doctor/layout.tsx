"use client";

import React, { useEffect, useRef, useState } from "react";
import DoctorHeader from "@/components/DoctorHeader";
import SocketContextProvider from "@/context/SocketContextProvider";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
import { PeerProvider } from "@/context/CallProvider";
import { SnackbarProvider } from "notistack";

const DoctorLayout = ({ children }: { children: React.ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     router.push("/auth/client/login");
  //   }
  // }, [router]);

  // get user from cookies
  useEffect(() => {
    if (!loggedInUser) {
      const user = Cookies.get("user");
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setLoggedInUser(parsedUser);
        } catch (err) {
          console.error("Failed to parse user cookie", err);
        }
      }
    }
  }, [loggedInUser]);

  return (
    <SocketContextProvider>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "right" }} autoHideDuration={4000}>
        <PeerProvider loggedInUser={loggedInUser}>
          <>
            <div className="min-h-screen bg-gray-50">
              <DoctorHeader />
              <main className="container max-w-[1350px] mx-auto p-6 space-y-6">{children}</main>
            </div>
            <Footer />
          </>
        </PeerProvider>
      </SnackbarProvider>
    </SocketContextProvider>
  );
};

export default DoctorLayout;
