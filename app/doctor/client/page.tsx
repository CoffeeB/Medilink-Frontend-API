"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
// import { DatePickerWithRange } from '@/components/DatePickerWithRange'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "react-signature-canvas";
import { newForm } from "@/hooks/form";
import { clientAppointments, editClientAppointment } from "@/hooks/appointments";

type ClientStatus = "Submitted" | "Pending" | "Review";

interface Diagnosis {
  id: string;
  date: string;
  name: string;
  status: ClientStatus;
  sex?: "male" | "female";
  time?: string;
  address?: string;
  signature?: string;
  assessment?: string;
}

export default function ClientDiagnosis() {
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [startDate, setStartDate] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [diagnoses, setDiagnoses] = useState<any>();
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit">("view");
  const [form, setForm] = useState<any>({
    clientName: "",
    sex: "",
    age: "",
    preferredDate: "",
    preferredTime: "",
    description: "",
    address: "",
    signature: "",
  });

  useEffect(() => {
    const getClientAppointments = async () => {
      try {
        const response = await clientAppointments();
        setDiagnoses(response);
      } catch (error) {
        console.log("error getting users", error);
      }
    };

    getClientAppointments();
  }, []);

  const filteredDiagnoses = diagnoses?.filter((diagnosis: any) => {
    const matchesSearch = diagnosis?.form?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || diagnosis?.form?.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = (!startDate || diagnosis?.form?.preferredDate >= startDate) && (!endDate || diagnosis?.form?.preferredDate <= endDate);
    return matchesSearch && matchesDateRange;
  });

  const [selected, setSelected] = useState<any>(null);
  const [assessment, setAssessment] = useState("");
  const [statusSel, setStatusSel] = useState("pending");
  const sigRef = useRef<SignatureCanvas | null>(null);

  const handleRowClick = (d: any) => {
    setFormMode("view");
    setSelected(d);
    setAssessment("");
    setStatusSel(d.status);
    setOpen(true);
    setTimeout(() => sigRef.current?.clear(), 0);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const doctorSignature = sigRef.current && !sigRef.current.isEmpty() ? sigRef.current.getCanvas().toDataURL("image/png") : null;

    const payload = {
      // keep appointment id so backend knows which to update
      id: selected?.form?._id,

      // doctor-related data
      assessment,
      status: statusSel,
      signature: doctorSignature,

      // include all form fields from patient appointment
      clientName: selected?.form?.clientName,
      sex: selected?.form?.sex,
      age: selected?.form?.age,
      preferredDate: selected?.form?.preferredDate,
      preferredTime: selected?.form?.preferredTime,
      description: selected?.form?.description,
      address: selected?.form?.address,
    };

    try {
      console.log("Confirming appointment with full payload:", payload);
      await editClientAppointment(payload);
      setOpen(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const canEdit = selected && (selected?.form?.status === "pending" || selected?.form?.status === "review");

  function handleAddAppointment() {
    setForm({
      id: "",
      clientName: "",
      sex: "",
      age: "",
      preferredDate: "",
      preferredTime: "",
      description: "",
      address: "",
      signature: "",
    });
    setFormMode("edit");
    setOpen(true);
    setTimeout(() => sigRef.current?.clear(), 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // stop full page refresh

    try {
      console.log("Submitting form:", form);

      const response = await newForm(form);

      // optionally close modal
      setOpen(false);

      // reset form
      setForm({
        id: "",
        clientName: "",
        sex: "",
        age: "",
        preferredDate: "",
        preferredTime: "",
        description: "",
        address: "",
        signature: "",
      });
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-base sm:text-lg font-medium">Client</CardTitle>
          <Button onClick={() => handleAddAppointment()} className="cursor-pointer">
            Add an Apt.
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search clients..." className="pl-8 w-full sm:w-[300px] text-sm sm:text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Showing {filteredDiagnoses?.length} of {diagnoses?.form?.length} clients
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
                {filteredDiagnoses?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-sm sm:text-base">
                      No Client found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDiagnoses?.map((diagnosis: any) => (
                    <TableRow key={diagnosis?.form?._id} className="cursor-pointer hover:bg-accent" onClick={() => handleRowClick(diagnosis)}>
                      <TableCell className="text-xs sm:text-sm">{new Date(diagnosis?.form?.preferredDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{diagnosis?.form?.clientName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${diagnosis?.form?.status === "Submitted" ? "bg-green-100 text-green-800" : diagnosis?.form?.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{diagnosis?.form?.status}</span>
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
          {selected && formMode === "view" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Appointment Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-sm sm:text-base">
                  <b>Client:</b> {selected?.form?.clientName}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Sex:</b> {selected?.form?.sex ?? "—"}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Date:</b> {selected?.form?.preferredDate}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Time:</b> {selected?.form?.preferredTime ?? "—"}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Address:</b> {selected?.form?.address ?? "—"}
                </p>
                {selected?.form?.status === "submitted" && (
                  <>
                    <p className="text-sm sm:text-base">
                      <b>Assessment Summary:</b> {selected?.form?.assessment ?? "—"}
                    </p>
                    <p className="text-sm sm:text-base">
                      <b>Status:</b> {selected?.form?.status}
                    </p>
                  </>
                )}
                {selected?.form?.signature ? (
                  <div>
                    <b className="text-sm sm:text-base">Client Signature:</b>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected?.form?.signature} alt="Client Signature" className="mt-2 border rounded-md w-32 sm:w-40" />
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <b>Client Signature:</b> None
                  </p>
                )}

                {canEdit && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 pt-2">
                      <div className="lg:col-span-2">
                        <Label className="mb-1 block text-xs sm:text-sm">Assessment Summary</Label>
                        <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="Write your assessment..." className="min-h-24 sm:min-h-28 text-sm sm:text-base" />
                      </div>

                      <div>
                        <Label className="mb-1 block text-xs sm:text-sm">Status</Label>
                        <Select defaultValue={selected?.form?.status || ""} value={statusSel} onValueChange={(v) => setStatusSel(v as ClientStatus)}>
                          <SelectTrigger className="text-sm sm:text-base text-black">
                            <SelectValue className="text-black" placeholder="Select status" />
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
                          <SignatureCanvas ref={sigRef} penColor="black" canvasProps={{ width: 500, height: 160, className: "border w-full h-[120px] sm:h-[160px]" }} backgroundColor="white" />
                        </div>
                        <div className="flex justify-between mt-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => sigRef.current?.clear()} className="text-xs sm:text-sm">
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button onClick={handleConfirm} className="w-full text-sm sm:text-base bg-secondary cursor-pointer">
                        Confirm
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {formMode === "edit" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">{form.id ? "Edit Appointment" : "New Appointment"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Client Name</Label>
                  <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
                </div>

                <div>
                  <Label>Sex</Label>
                  <Select value={form.sex} onValueChange={(val) => setForm({ ...form, sex: val as "male" | "female" })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-md border rounded-md">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Age</Label>
                  <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
                </div>

                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} required />
                </div>

                <div>
                  <Label>Time</Label>
                  <Input type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} required />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the reason for appointment" rows={4} maxLength={500} required />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Enter address" required />
                </div>

                <div>
                  <Label>Signature</Label>
                  <div className="border rounded-md p-2">
                    <SignatureCanvas
                      ref={sigRef}
                      penColor="black"
                      canvasProps={{
                        width: 400,
                        height: 150,
                        className: "border w-full h-[150px]",
                      }}
                      onEnd={() => {
                        if (sigRef.current) {
                          const data = sigRef.current.getCanvas().toDataURL("image/png");
                          setForm({ ...form, signature: data });
                        }
                      }}
                      backgroundColor="white"
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        sigRef.current?.clear();
                        setForm({ ...form, signature: "" });
                      }}>
                      Clear
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-secondary cursor-pointer">
                  {form.id ? "Update Appointment" : "Add Appointment"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
