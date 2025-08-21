'use client'

import React from 'react'
import { useState } from "react";
import Image from 'next/image'
import { Button } from './ui/button'
import Link from 'next/link'
// import { usePathname } from 'next/navigation'
import { Menu, X } from "lucide-react";

const MarketerHeader = () => {
  // const pathname = usePathname()
   const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    return typeof window !== "undefined" && window.location.pathname === path;
  };

  // const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white border-b">
      <div className="mx-auto max-w-[1350px]">
        <div className="flex items-center justify-between h-[80px] px-6 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Image
              src="/images/logo.png"
              alt="Next.js logo"
              width={150}
              height={32}
              priority
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-9">
            <Link className={`hover:text-primary ${isActive('/marketer/appointments') ? 'text-primary' : ''}`} href="/marketer/appointments">Appointments</Link>
            <Link className={`hover:text-primary ${isActive('/marketer/messaging') ? 'text-primary' : ''}`} href="/marketer/messages">Messaging</Link>
            <Link className={`hover:text-primary ${isActive('/marketer/register-a-doc') ? 'text-primary' : ''}`} href="/marketer/register-a-doc">Register a Doctor</Link>
          </nav>

          {/* Right Side - Profile */}
          <div className="flex items-center space-x-4">
            <Link href="/marketer/profile">
              <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-secondary hover:bg-secondary text-white hover:text-white cursor-pointer">
                MI
              </Button>
            </Link>
            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden bg-white border-t flex flex-col space-y-2 px-6 py-4">            
            <Link onClick={() => setMobileOpen(false)} href="/doctor/appointments" className={`hover:text-primary ${isActive('/doctor/appointments') ? 'text-primary' : ''}`}>Appointments</Link>
            <Link onClick={() => setMobileOpen(false)} href="/doctor/messaging" className={`hover:text-primary ${isActive('/doctor/messaging') ? 'text-primary' : ''}`}>Messaging</Link>
            <Link onClick={() => setMobileOpen(false)} href="/doctor/client" className={`hover:text-primary ${isActive('/doctor/diagnosis') ? 'text-primary' : ''}`}>Register a Doctor</Link>
          </nav>
        )}
      </div>
    </header>
  )
}

export default MarketerHeader
