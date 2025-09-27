import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PendingApproval() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gray-50">
      <main className="flex flex-col gap-5 row-start-2 items-center sm:items-start text-center sm:text-left">
        <Image src="/images/logo.svg" alt="Excel Connect logo" width={180} height={38} priority />

        <h1 className="text-2xl font-semibold text-gray-800">Account Pending Approval</h1>

        <p className="max-w-md text-gray-600 text-sm sm:text-base">Your account has been created but is not yet approved. Our admin team will review your information and reach out to you once your account has been approved. You’ll receive a notification when it’s ready.</p>

        <Link href="/">
          <Button className="mt-4 bg-secondary cursor-pointer">Return to Home</Button>
        </Link>
      </main>
    </div>
  );
}
