'use client';

import React, { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, FileText, CreditCard, Shield } from 'lucide-react';
import countries from "world-countries";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(
    (val) =>
      /^(\+234|0)\d{10}$/.test(val.replace(/\s+/g, "")) ||
      /^(\+?\d{6,14})$/.test(val.replace(/\s+/g, "")),
    "Invalid phone number format"
  );

  const countryOptions = countries
  .map((country) => ({
    label: country.name.common,
    value: country.cca2, // ISO 2-letter code
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const registerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: phoneSchema,
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  streetAddress: z.string().min(1, "Street Address is required"),
  streetAddressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  region: z.string().min(1, "Region is required"),
  postalCode: z.string().min(1, "Postal/Zip code is required"),
  country: z.string().min(1, "Country is required"),
  driversLicense: z.any().optional(),
  ssn: z.any().optional(),
  resume: z.any().optional(),
});

type FormValues = z.infer<typeof registerFormSchema>;

export default function MarketerRegister() {
  // const [activeTab, setActiveTab] = useState<'marketer' | 'doctor'>('marketer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      dateOfBirth: "",
      phoneNumber: "",
      email: "",   
      streetAddress: "",
      streetAddressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Handle form submission here
      console.log('Form data:', data);
      // Redirect after successful registration
      router.push('/marketer/login');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState<{
    driversLicense?: File;
    ssn?: File;
    resume?: File;
  }>({});

  const [isDragging, setIsDragging] = useState<string | null>(null)

  const handleFileUpload = (field: keyof typeof uploadedFiles, file: File) => {
    form.setValue(field, file);
    setUploadedFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleRemoveFile = (field: keyof typeof uploadedFiles) => {
    form.setValue(field, undefined);
    setUploadedFiles((prev) => ({ ...prev, [field]: undefined }));
  };

  const renderFileSection = (
    field: keyof typeof uploadedFiles,
    icon: React.ReactNode,
    title: string
  ) => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-colors bg-gray-100 ${
        isDragging === field ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
      }`}
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
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p className="text-xs text-gray-500">
              Drag & drop your file or click to upload
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => document.getElementById(field)?.click()}
        >
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
              <p className="text-sm font-medium text-gray-700">
                {uploadedFiles[field]?.name}
              </p>
              <p className="text-xs text-gray-500">
                {((uploadedFiles[field]?.size || 0) / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFile(field)}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Marketer/Agent</h1>
            
            {/* Tabs */}
            {/* <div className="flex justify-center space-x-8 border-b border-gray-200">
              <button
                onClick={() => handleTabClick("marketer")}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'marketer'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Marketer
              </button>
              <button
                onClick={() => handleTabClick("doctor")}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors  ${
                  activeTab === 'doctor'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Doctor
              </button>
            </div> */}
          </div>

          {/* Registration Form */}
          <Card className="shadow-xl border-none">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Marketer Registration
              </h2>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">First name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input  
                                placeholder="Enter first name" 
                                type='text'
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Date of Birth</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="dd/mm/yyyy" 
                                type='date'
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Middle name (optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input  
                                placeholder="Enter middle name" 
                                type='text'
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input  
                                placeholder="Enter Phone number" 
                                type='tel'
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Last name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input  
                                placeholder="Enter last name"
                                type='text' 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input  
                                placeholder="Enter email" 
                                type="email"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address - Full Width */}
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Street Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Street Address" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="streetAddressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Street Address Line 2" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <Input placeholder="City" {...field} />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <Input placeholder="Region" {...field} />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <Input placeholder="Postal / Zip Code" {...field} />
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <select
                          {...field}
                          className="border border-gray-300 rounded-md p-2 w-full"
                        >
                          <option value="">Select Country</option>
                          {countryOptions.map((country) => (
                            <option key={country.value} value={country.value}>
                              {country.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Document Upload Sections */}
                    <h3 className="text-lg font-medium text-gray-900">Document Upload</h3>
                    
                    {/* Drivers License */}
                  <div className="grid gap-6 ">
                    {renderFileSection("driversLicense", <CreditCard className="h-6 w-6 text-gray-400" />, "Driver's License")}
                    {renderFileSection("ssn", <Shield className="h-6 w-6 text-gray-400" />, "SSN")}
                    {renderFileSection("resume", <FileText className="h-6 w-6 text-gray-400" />, "Resume")}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full py-3 text-lg font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/marketer/login" className="text-secondary hover:text-secondary/80 font-medium">
                        Login here
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

