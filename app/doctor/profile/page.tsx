'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Calendar, Dna, Phone, Eye, EyeOff } from 'lucide-react'
import UpdateClientSignatureForm from "@/components/forms/UpdateClientSignatureForm"
import ChangePinForm from "@/components/forms/ChangePinForm"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"

export default function DoctorProfile() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openClientSignature, setOpenClientSignature] = useState(false);
  // const [openParentSignature, setOpenParentSignature] = useState(false);
  const [openClientPin, setOpenClientPin] = useState(false);
  // const [openParentPin, setOpenParentPin] = useState(false);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  // const [parentSignature, setParentSignature] = useState<string | null>(null);

  const handleClientPinChange = (oldPin: string, newPin: string) => {
    console.log('Changing client PIN:', { oldPin, newPin });
    // Add API call to change PIN here
  };

  // const handleParentPinChange = (oldPin: string, newPin: string) => {
    // console.log('Changing parent PIN:', { oldPin, newPin });
    // Add API call to change PIN here
  // };

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Client Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-medium">
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button variant="ghost" className="relative h-16 w-16 sm:h-10 sm:w-10 p-10 rounded-full bg-secondary hover:bg-secondary text-white hover:text-white cursor-pointer self-center sm:self-auto">
                WB
              </Button>
              <div className="flex flex-col text-center sm:text-left">
                <h3 className="font-semibold text-secondary text-base sm:text-lg">
                  Werey Babatunde
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  305 FM 517 Road E.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Dickinson, TX 77539-1628
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-2 sm:p-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">DOB:</p>
                  <p className="font-medium text-sm sm:text-base">06/05/1998</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border rounded-lg p-2 sm:p-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Dna className="w-5 h-5 sm:w-7 sm:h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sex:</p>
                  <p className="font-medium text-sm sm:text-base">Male</p>
                </div>
              </div>

              
            </div>
          </CardContent>
        </Card>

        {/* Clinic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-medium">
              Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="font-semibold text-secondary text-base sm:text-lg">
                Auspicious Community Service, LLC
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                305 FM 517 Road E.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Dickinson, TX 77539-1628
              </p>
              <div className="flex items-center gap-2 border rounded-lg p-2 mt-2 text-emerald-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm sm:text-base">(832) 774-7144</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <p className="font-medium text-sm sm:text-base">Doctor Signature</p>
                <div className="flex items-center justify-center border rounded-lg p-3 sm:p-4 h-20 sm:h-24 bg-gray-50">
                  {clientSignature ? (
                    <Image src={clientSignature} alt="Client Signature" height={100} width={100} className="h-full w-auto" />
                  ) : (
                    <p className="text-muted-foreground text-xs sm:text-sm"></p>
                  )}
                </div>
                <Dialog open={openClientSignature} onOpenChange={setOpenClientSignature}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full text-sm sm:text-base">
                      Update Signature
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] max-w-md sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Update Signature</DialogTitle>
                      <UpdateClientSignatureForm onSignatureUpdate={setClientSignature} setOpen={setOpenClientSignature} />
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="w-full text-sm sm:text-base"
                  onClick={() => setOpenClientPin(true)}
                >
                  Change PIN?
                </Button>
                <Dialog open={openClientPin} onOpenChange={setOpenClientPin}>
                  <DialogContent className="w-[90vw] max-w-md sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Change Client PIN</DialogTitle>
                    </DialogHeader>
                    <ChangePinForm setOpen={setOpenClientPin} onPinChange={handleClientPinChange} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 sm:space-y-4 mt-1">
                <p className="font-medium text-sm sm:text-base">Reset Password</p>

                {/* Password Input */}
                <div>
                  <label className="block mb-1 text-xs sm:text-sm">Password</label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="pr-10 text-sm sm:text-base" // Add padding-right to make space for the icon
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block mb-1 text-xs sm:text-sm">Confirm Password</label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm new password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="pr-10 text-sm sm:text-base" // Add padding-right to make space for the icon
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                              
                <Button variant="secondary" className="w-full text-sm sm:text-base">
                  Reset Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  )
}
