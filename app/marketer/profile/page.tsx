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

import { Calendar, Dna, Phone } from 'lucide-react'
import UpdateClientSignatureForm from "@/components/forms/UpdateClientSignatureForm"
// import ChangePinForm from "@/components/forms/ChangePinForm"

import { useState } from "react"
import Image from "next/image"

export default function DoctorDashboard() {
  const [openClientSignature, setOpenClientSignature] = useState(false);
  // const [openParentSignature, setOpenParentSignature] = useState(false);
  const [openClientPin, setOpenClientPin] = useState(false);
  // const [openParentPin, setOpenParentPin] = useState(false);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  // const [parentSignature, setParentSignature] = useState<string | null>(null);

  // const handleClientPinChange = (oldPin: string, newPin: string) => {
    // console.log('Changing client PIN:', { oldPin, newPin });
    // Add API call to change PIN here
  // };

  // const handleParentPinChange = (oldPin: string, newPin: string) => {
    // console.log('Changing parent PIN:', { oldPin, newPin });
    // Add API call to change PIN here
  // };

  return (
    <div className="container max-w-[1350px] mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Client Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Marketer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="relative h-10 w-10 p-10 rounded-full bg-secondary hover:bg-secondary text-white hover:text-white cursor-pointer">
                WB
              </Button>
              <div className="flex flex-col">
                <h3 className="font-semibold text-secondary">
                  Werey Babatunde
                </h3>
                <p className="text-sm text-muted-foreground">
                  305 FM 517 Road E.
                </p>
                <p className="text-sm text-muted-foreground">
                  Dickinson, TX 77539-1628
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DOB:</p>
                  <p className="font-medium">06/05/1998</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border rounded-lg p-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Dna className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sex:</p>
                  <p className="font-medium">Male</p>
                </div>
              </div>

              
            </div>
          </CardContent>
        </Card>

        {/* Clinic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Clinic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-secondary">
                Auspicious Community Service, LLC
              </h3>
              <p className="text-sm text-muted-foreground">
                305 FM 517 Road E.
              </p>
              <p className="text-sm text-muted-foreground">
                Dickinson, TX 77539-1628
              </p>
              <div className="flex items-center gap-2 border rounded-lg p-2 mt-2 text-emerald-600">
                <Phone className="w-4 h-4" />
                <span>(832) 774-7144</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="font-medium">Marketer Signature</p>
                <div className="flex items-center justify-center border rounded-lg p-4 h-24 bg-gray-50">
                  {clientSignature ? (
                    <Image src={clientSignature} alt="Client Signature" height={100} width={100} className="h-full w-auto" />
                  ) : (
                    <p className="text-muted-foreground text-sm"></p>
                  )}
                </div>
                <Dialog open={openClientSignature} onOpenChange={setOpenClientSignature}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      Update Signature
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Signature</DialogTitle>
                      <UpdateClientSignatureForm onSignatureUpdate={setClientSignature} setOpen={setOpenClientSignature} />
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpenClientPin(true)}
                >
                  Change PIN?
                </Button>
                <Dialog open={openClientPin} onOpenChange={setOpenClientPin}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Client PIN</DialogTitle>
                    </DialogHeader>
                    {/* <ChangePinForm setOpen={setOpenClientPin} onPinChange={handleClientPinChange} /> */}
                  </DialogContent>
                </Dialog>
              </div>

              
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  )
}
