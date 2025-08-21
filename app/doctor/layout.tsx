"use client";

import React from "react";
// import { useRouter } from "nextjs-toploader/app";
import DoctorHeader from "@/components/DoctorHeader";
// import { isAuthenticated } from "@/hooks/auth";
import SocketContextProvider from "@/context/SocketContextProvider";
import Footer from "@/components/Footer";

const DoctorLayout = ({ children }: { children: React.ReactNode }) => {
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     router.push("/auth/client/login");
  //   }
  // }, [router]);

  return (
    <SocketContextProvider>
      <>
      {/* <div className="min-h-screen bg-gray-50">
        <DoctorHeader />
        {children}
      </div> */}
      <div className="min-h-screen bg-gray-50">
        <DoctorHeader />
      <main className="container max-w-[1350px] mx-auto p-6 space-y-6">
        
          {children}
        </main>
      </div>
      <Footer />
      </>
    </SocketContextProvider>
  );
};

export default DoctorLayout;
