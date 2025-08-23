'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
// import { DatePickerWithRange } from '@/components/DatePickerWithRange'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import SignatureCanvas from 'react-signature-canvas'

type ClientStatus = "Submitted" | "Pending" | "Review";

interface Diagnosis {
  id: string;
  date: string;
  name: string;
  status: ClientStatus;
  sex?: 'male' | 'female'
  time?: string
  address?: string
  signature?: string
  assessment?: string
}

export default function ClientDiagnosis() {
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [startDate, setStartDate] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [endDate, setEndDate] = useState('');

  const diagnoses: Diagnosis[] = [
    {
      id: 'D001',
      date: '2024-01-15',
      name: 'John Doe',
      sex: 'male',
      time: '10:00 AM',
      address: '123 Main St, City, Country',
      assessment: 'Initial consultation and assessment completed.',
      // signature: 'data:image/png;base64,...',
      status: "Submitted",
    },
    {
      id: 'D002',
      date: '2023-12-01',
      name: 'Mary Johnson',
      status: "Pending",
    },
    {
      id: 'D003',
      date: '2023-10-15',
      name: 'Alex Lee',
      status: "Review",
    },
  ];

  const filteredDiagnoses = diagnoses.filter(diagnosis => {
    const matchesSearch = diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = (!startDate || diagnosis.date >= startDate) &&
      (!endDate || diagnosis.date <= endDate);
    return matchesSearch && matchesDateRange;
  });

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Diagnosis | null>(null)
  const [assessment, setAssessment] = useState('')
  const [statusSel, setStatusSel] = useState<ClientStatus>('Pending')
  const sigRef = useRef<SignatureCanvas | null>(null)

  const handleRowClick = (d: Diagnosis) => {
    setSelected(d)
    setAssessment('')
    setStatusSel(d.status)
    setOpen(true)
    setTimeout(() => sigRef.current?.clear(), 0)
  }

  const handleConfirm = () => {
    if (!selected) return
    const doctorSignature = sigRef.current && !sigRef.current.isEmpty()
      ? sigRef.current.getCanvas().toDataURL('image/png')
      : null

    console.log({
      id: selected.id,
      assessment,
      status: statusSel,
      doctorSignature,
    })
    setOpen(false)
  }

  const canEdit = selected && (selected.status === 'Pending' || selected.status === 'Review')

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-base sm:text-lg font-medium">Client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-8 w-full sm:w-[300px] text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* <DatePickerWithRange className='md:w-7xl'/> */}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredDiagnoses.length} of {diagnoses.length} clients
              </span>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Client Name</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiagnoses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm sm:text-base">
                      No Client found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiagnoses.map((diagnosis) => (
                    <TableRow key={diagnosis.id} className="cursor-pointer hover:bg-accent" onClick={() => handleRowClick(diagnosis)}>
                      <TableCell className="text-xs sm:text-sm">{new Date(diagnosis.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{diagnosis.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${diagnosis.status === "Submitted" ? "bg-green-100 text-green-800" : diagnosis.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                          {diagnosis.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Appointment Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-sm sm:text-base"><b>Client:</b> {selected.name}</p>
                <p className="text-sm sm:text-base"><b>Sex:</b> {selected.sex ?? '—'}</p>
                <p className="text-sm sm:text-base"><b>Date:</b> {selected.date}</p>
                <p className="text-sm sm:text-base"><b>Time:</b> {selected.time ?? '—'}</p>
                <p className="text-sm sm:text-base"><b>Address:</b> {selected.address ?? '—'}</p>
                {selected.status === 'Submitted' && (
                  <>
                    <p className="text-sm sm:text-base"><b>Assessment Summary:</b> {selected.assessment ?? '—'}</p>
                    <p className="text-sm sm:text-base"><b>Status:</b> {selected.status}</p>
                  </>
                )}
                {selected.signature ? (
                  <div>
                    <b className="text-sm sm:text-base">Client Signature:</b>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.signature} alt="Client Signature" className="mt-2 border rounded-md w-32 sm:w-40" />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground"><b>Client Signature:</b> None</p>
                )}

                {canEdit && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 pt-2">
                      <div className="lg:col-span-2">
                        <Label className="mb-1 block text-xs sm:text-sm">Assessment Summary</Label>
                        <Textarea
                          value={assessment}
                          onChange={(e) => setAssessment(e.target.value)}
                          placeholder="Write your assessment..."
                          className="min-h-24 sm:min-h-28 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <Label className="mb-1 block text-xs sm:text-sm">Status</Label>
                        <Select value={statusSel} onValueChange={(v) => setStatusSel(v as ClientStatus)}>
                          <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-md border rounded-md">
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Submitted">Submitted</SelectItem>
                            <SelectItem value="Review">Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="lg:col-span-2">
                        <Label className="mb-1 block text-xs sm:text-sm">Doctor Signature</Label>
                        <div className="border rounded-md p-2 bg-white">
                          <SignatureCanvas
                            ref={sigRef}
                            penColor="black"
                            canvasProps={{ width: 500, height: 160, className: 'border w-full h-[120px] sm:h-[160px]' }}
                            backgroundColor="white"
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => sigRef.current?.clear()} className="text-xs sm:text-sm">
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button onClick={handleConfirm} className="w-full text-sm sm:text-base">Confirm</Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
