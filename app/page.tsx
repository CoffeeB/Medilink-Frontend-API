import Image from "next/image";
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          src="/images/logo.png"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          
            <Button asChild>
              <Link href="/marketer/login">
                Marketer Login <ArrowRight />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/doctor/login">
                Doctor Login <ArrowRight />
              </Link>
            </Button>          
        </div>
      </main>
    </div>
  );
}
