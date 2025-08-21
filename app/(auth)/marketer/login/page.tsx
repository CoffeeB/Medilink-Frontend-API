'use client';

import { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { login, loginFormSchema, } from '@/hooks/auth';
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';

const formSchema = loginFormSchema;

type FormValues = z.infer<typeof formSchema>;

export default function MarketerLogin() {
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError('');

    try {
      const { user } = await login(data);

      if (user.role === 'marketer') {
        router.push('/marketer/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        
        <p className='text-gray-600 mb-4 text-center max-w-lg' >Welcome back, you can connect clients with doctors through a convenient, safe and secure environment.</p>
        <Card className="w-full max-w-md shadow-xl rounded-md border-none">
          <CardHeader>
            <p className='font-bold text-lg inline-flex items-center'>Log into Marketer Portal</p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-800 font-semibold'>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
                          <Input className='mt-0 pl-10' placeholder="Enter your username" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-800 flex justify-between'>
                        <span className='font-semibold'>Password</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="h-4 w-4 absolute left-3 top-2.5 text-gray-500" />
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button variant="secondary" type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center justify-center font-bold">
                      <Loader className='spinner-border animate-spin' />
                      <span className="ml-2">Logging in...</span>
                    </div>
                  ) : (
                    <span className='font-bold cursor-pointer'>Login <ArrowRight className='inline-block ml-1' /></span>
                  )}
                </Button>
                <div className="flex justify-between">
                  <Link href="/forgot-password" className="text-xs text-primary">
                    Forgot password?
                  </Link>
                  <Link href="/marketer/register" className="text-xs text-primary">
                    Register
                  </Link>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
