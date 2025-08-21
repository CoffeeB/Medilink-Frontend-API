import type { Metadata } from "next";
import { Raleway } from "next/font/google";
// import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Theralink",
  description: "Theralink - Your Therapy Management Solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <NextTopLoader color="#0448E7" /> */}
      <body className={raleway.className}>
        {children}
      </body>
      {/* <Toaster /> */}
    </html>
  );
}
