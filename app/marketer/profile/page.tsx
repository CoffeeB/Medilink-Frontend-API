"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Dna, Phone, Eye, EyeOff, Edit2, X, Upload, FileText, CreditCard, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UpdateClientSignatureForm from "@/components/forms/UpdateClientSignatureForm";
import ChangePinForm from "@/components/forms/ChangePinForm";
import AvatarUpload from "@/components/AvatarUpload";
import Image from "next/image";
import { format } from "date-fns";
import { getProfile, updateProfile } from "@/hooks/profile";

export default function MarketerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [editableProfile, setEditableProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openClientSignature, setOpenClientSignature] = useState(false);
  const [openClientPin, setOpenClientPin] = useState(false);
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{
    certificate?: File;
    driversLicense?: File;
    ssn?: File;
    resume?: File;
  }>({});

  const [isDragging, setIsDragging] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await getProfile();
        console.log("profile, ", profile);

        setProfile(response);
        setEditableProfile(response); // copy for editing
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfileData();
  }, []);

  const handleFileUpload = (field: keyof typeof uploadedFiles, file: File) => {
    setUploadedFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleRemoveFile = (field: keyof typeof uploadedFiles) => {
    setUploadedFiles((prev) => ({ ...prev, [field]: undefined }));
  };

  const renderFileSection = (field: keyof typeof uploadedFiles, icon: React.ReactNode, title: string) => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-colors bg-gray-100 ${isDragging === field ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(field);
      }}
      onDragLeave={() => setIsDragging(null)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(null);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(field, file);
      }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-xs text-gray-500">Drag & drop your file or click to upload</p>
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById(field)?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          {uploadedFiles[field] ? "Change" : "Upload"}
        </Button>
      </div>

      <input
        id={field}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(field, file);
        }}
      />

      {/* Preview section */}
      {uploadedFiles[field] && (
        <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div>
              <p className="text-sm font-medium text-gray-700">{uploadedFiles[field]?.name}</p>
              <p className="text-xs text-gray-500">{((uploadedFiles[field]?.size || 0) / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(field)}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );

  const handleClientPinChange = (oldPin: string, newPin: string) => {
    console.log("Changing client PIN:", { oldPin, newPin });
    // Add API call to change PIN here
  };

  const handleSave = async () => {
    try {
      const updated = await updateProfile(editableProfile);
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  return (
    <div className="container max-w-[1350px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        {isEditing ? (
          <>
            <Button variant="secondary" onClick={handleSave} className="mr-2">
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditableProfile(profile);
                setIsEditing(false);
              }}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-1" /> Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Doctor Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-medium">Doctor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <AvatarUpload
                onImageChange={(file, imageUrl) => {
                  console.log("Avatar changed:", file, imageUrl);
                  if (isEditing) {
                    setEditableProfile({ ...editableProfile, avatar: imageUrl });
                  }
                }}
              />
              <div className="flex flex-wrap text-center sm:text-left">
                {isEditing ? (
                  <>
                    <Input value={editableProfile?.firstname || ""} onChange={(e) => setEditableProfile({ ...editableProfile, firstname: e.target.value })} placeholder="First Name" className="mb-2" />
                    <Input value={editableProfile?.lastname || ""} onChange={(e) => setEditableProfile({ ...editableProfile, lastname: e.target.value })} placeholder="Last Name" />
                    <Input value={editableProfile?.address || ""} onChange={(e) => setEditableProfile({ ...editableProfile, address: e.target.value })} placeholder="Address" className="mt-2" />
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-secondary text-base sm:text-lg">
                      {profile?.firstname} {profile?.lastname}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{profile?.address}</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-2 sm:p-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">DOB:</p>
                  {isEditing ? <Input type="date" value={editableProfile?.dateofBirth || ""} onChange={(e) => setEditableProfile({ ...editableProfile, dateofBirth: e.target.value })} /> : <p className="font-medium text-sm sm:text-base">{profile?.dateofBirth ? format(new Date(profile.dateofBirth), "do MMM yyyy") : ""}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 border rounded-lg p-2 sm:p-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Dna className="w-5 h-5 sm:w-7 sm:h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sex:</p>
                  {isEditing ? <Input value={editableProfile?.sex || ""} onChange={(e) => setEditableProfile({ ...editableProfile, sex: e.target.value })} placeholder="male/female" /> : <p className="font-medium text-sm sm:text-base">{profile?.sex}</p>}
                </div>
              </div>
            </div>

            {/* <div className="grid gap-6 ">
              {renderFileSection("certificate", <FileText className="h-6 w-6 text-gray-400" />, "Certificate")}
              {renderFileSection("driversLicense", <CreditCard className="h-6 w-6 text-gray-400" />, "Driver's License")}
              {renderFileSection("ssn", <Shield className="h-6 w-6 text-gray-400" />, "SSN")}
              {renderFileSection("resume", <FileText className="h-6 w-6 text-gray-400" />, "Resume")}
            </div> */}
          </CardContent>
        </Card>

        {/* Clinic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-medium">Clinic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div>
              {isEditing ? (
                <>
                  <Input value={editableProfile?.clinicName || ""} onChange={(e) => setEditableProfile({ ...editableProfile, clinicName: e.target.value })} placeholder="Clinic Name" className="mb-2" />
                  <Input value={editableProfile?.clinicAddressLine1 || ""} onChange={(e) => setEditableProfile({ ...editableProfile, clinicAddressLine1: e.target.value })} placeholder="Street Address" className="mb-2" />
                  <Input value={editableProfile?.clinicAddressLine2 || ""} onChange={(e) => setEditableProfile({ ...editableProfile, clinicAddressLine2: e.target.value })} placeholder="City, State, ZIP" className="mb-2" />
                  <Input value={editableProfile?.phone || ""} onChange={(e) => setEditableProfile({ ...editableProfile, phone: e.target.value })} placeholder="Phone Number" />
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-secondary text-base sm:text-lg">Auspicious Community Service, LLC</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">305 FM 517 Road E.</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Dickinson, TX 77539-1628</p>
                  <div className="flex items-center gap-2 border rounded-lg p-2 mt-2 text-emerald-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm sm:text-base">{profile?.phone}</span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <p className="font-medium text-sm sm:text-base">Doctor Signature</p>
                <div className="flex items-center justify-center border rounded-lg p-3 sm:p-4 h-20 sm:h-24 bg-gray-50">{clientSignature ? <Image src={profile?.signatureUrl} alt="Client Signature" height={100} width={100} className="h-full w-auto" /> : <p className="text-muted-foreground text-xs sm:text-sm"></p>}</div>
                <Dialog open={openClientSignature} onOpenChange={setOpenClientSignature}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full text-sm sm:text-base cursor-pointer">
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
                {/* <Button variant="outline" className="w-full text-sm sm:text-base cursor-pointer" onClick={() => setOpenClientPin(true)}>
                  Change PIN?
                </Button> */}
                {/* <Dialog open={openClientPin} onOpenChange={setOpenClientPin}>
                  <DialogContent className="w-[90vw] max-w-md sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Change Client PIN</DialogTitle>
                    </DialogHeader>
                    <ChangePinForm setOpen={setOpenClientPin} onPinChange={handleClientPinChange} />
                  </DialogContent>
                </Dialog> */}
              </div>

              <div className="space-y-3 sm:space-y-4 mt-1">
                <p className="font-medium text-sm sm:text-base">Reset Password</p>

                {/* Password Input */}
                <div>
                  <label className="block mb-1 text-xs sm:text-sm">Password</label>
                  <div className="relative">
                    <Input placeholder="Enter your password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-10 text-sm sm:text-base" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block mb-1 text-xs sm:text-sm">Confirm Password</label>
                  <div className="relative">
                    <Input placeholder="Confirm new password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" className="pr-10 text-sm sm:text-base" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button variant="secondary" className="w-full text-sm sm:text-base cursor-pointer">
                  Reset Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
