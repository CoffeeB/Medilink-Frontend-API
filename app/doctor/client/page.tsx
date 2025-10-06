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
import Cookies from "js-cookie";
import { clientAppointments, createDoctorAppointment, deleteClientAppointment, editClientAppointmentAsDoctor } from "@/hooks/appointments";

type ClientStatus = "submitted" | "pending" | "review";

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

export default function DoctorClientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [startDate, setStartDate] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState<"view" | "edit" | "create">("view");
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [form, setForm] = useState<any>({
    clientName: "",
    sex: "",
    age: "",
    date: "",
    time: "",
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

  const filteredDiagnoses = diagnoses?.filter((diagnosis: any) => {
    const matchesSearch = diagnosis?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || diagnosis?.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDateRange = (!startDate || diagnosis?.date >= startDate) && (!endDate || diagnosis?.date <= endDate);
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

    const signatureUrl = await handleSignatureSave();

    if (!signatureUrl) {
      console.error("Signature upload failed");
      return;
    }

    const payload = {
      // keep appointment id so backend knows which to update
      id: selected?._id,

      // doctor-related data
      // assessment,
      status: statusSel,
      signature: signatureUrl,

      // include all form fields from patient appointment
      clientName: selected?.clientName,
      sex: selected?.sex,
      age: selected?.age,
      date: selected?.date,
      time: selected?.time,
      description: selected?.description,
      address: selected?.address,
    };

    try {
      console.log("Confirming appointment with full payload:", payload);
      await editClientAppointmentAsDoctor(payload);
      setOpen(false);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const canEdit = selected && (selected?.status === "pending" || selected?.status === "submitted");

  function handleAddAppointment() {
    setFormMode("create");
    setOpen(true);
    setTimeout(() => sigRef.current?.clear(), 0);
  }

  const handleSignatureSave = async () => {
    if (!sigRef.current) return;

    // Convert base64 signature to blob
    const dataUrl = sigRef.current.toDataURL("image/png");
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], "signature.png", { type: "image/png" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", loggedInUser.id); // pass user ID

      const response = await fetch("/api/upload/signature", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.fileUrl) {
        console.log("✅ Signature uploaded:", data.fileUrl);
        return data.fileUrl;
      } else {
        console.error("Upload failed:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save signature first
      const signatureUrl = await handleSignatureSave();

      if (!signatureUrl) {
        console.error("Signature upload failed");
        return;
      }

      // Payload should contain the S3 URL, not base64
      const payload = {
        signature: signatureUrl,
        clientName: form?.clientName,
        sex: form?.sex,
        age: form?.age,
        date: form?.date,
        time: form?.time,
        description: form?.description,
        address: form?.address,
      };

      const response = await createDoctorAppointment(payload);

      const clientDiagnoses = response?.appointment;
      setOpen(false);
      setDiagnoses((prev) => [...prev, clientDiagnoses]);

      // reset form
      setForm({
        id: "",
        clientName: "",
        sex: "",
        age: "",
        date: "",
        time: "",
        description: "",
        address: "",
        signature: "",
      });
    } catch (error) {
      console.log("Error submitting form:", error);
    }
  };

  const deleteClient = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteClientAppointment(id);

      // simulate API success
      setDiagnoses((prev: any) => prev.filter((client: any) => client._id !== id));
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-base sm:text-lg font-medium">Client</CardTitle>
          <Button onClick={() => handleAddAppointment()} className="cursor-pointer">
            Add a Client
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
                Showing {filteredDiagnoses?.length} of {diagnoses?.length} clients
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
                  <TableHead className="text-xs sm:text-sm">Action</TableHead>
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
                  filteredDiagnoses
                    ?.filter((d: any) => d?.client?.name && d?.date && d?.status)
                    ?.map((diagnosis: any, index: any) => (
                      <TableRow key={index} className="cursor-pointer hover:bg-accent" onClick={() => handleRowClick(diagnosis)}>
                        <TableCell className="text-xs sm:text-sm">{diagnosis?.date}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{diagnosis?.client?.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${diagnosis?.status === "review" ? "bg-green-100 text-green-800" : diagnosis?.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{diagnosis?.status}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation(); // 🚀 prevents row click
                              deleteClient(diagnosis?._id);
                            }}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 hover:bg-red-200 text-white hover:text-red-600 cursor-pointer text-sm py-1 h-auto">
                            Delete
                          </Button>
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
          {/* VIEW MODE */}
          {selected && formMode === "view" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Client Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <p className="text-sm sm:text-base">
                  <b>Client:</b> {selected?.client?.name}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Sex:</b> {selected?.sex ?? "—"}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Date:</b> {selected?.date}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Time:</b> {selected?.time ?? "—"}
                </p>
                <p className="text-sm sm:text-base">
                  <b>Address:</b> {selected?.address ?? "—"}
                </p>
                {selected?.status === "submitted" && (
                  <>
                    <p className="text-sm sm:text-base">
                      <b>Assessment Summary:</b> {selected?.assessment ?? "—"}
                    </p>
                    <p className="text-sm sm:text-base">
                      <b>Status:</b> {selected?.status}
                    </p>
                  </>
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
                        <Select defaultValue={selected?.status || ""} value={statusSel} onValueChange={(v) => setStatusSel(v as ClientStatus)}>
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
                          <SignatureCanvas
                            ref={sigRef}
                            penColor="black"
                            canvasProps={{
                              width: 500,
                              height: 160,
                              className: "border w-full h-[120px] sm:h-[160px]",
                            }}
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
                      <Button onClick={handleConfirm} className="w-full text-sm sm:text-base bg-secondary cursor-pointer">
                        Confirm
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* CREATE MODE */}
          {formMode === "create" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">New Client</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm">Client</Label>
                  <Input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Sex</Label>
                  <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Time</Label>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Assessment Summary</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write your assessment..." required />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ClientStatus })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Doctor Signature</Label>
                  <div className="border rounded-md p-2 bg-white">
                    <SignatureCanvas
                      ref={sigRef}
                      penColor="black"
                      canvasProps={{
                        width: 500,
                        height: 160,
                        className: "border w-full h-[120px] sm:h-[160px]",
                      }}
                      backgroundColor="white"
                      onEnd={() => setForm({ ...form, signature: sigRef.current?.toDataURL() })}
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
                      }}
                      className="text-xs sm:text-sm">
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full text-sm sm:text-base bg-secondary cursor-pointer">
                    Submit
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
