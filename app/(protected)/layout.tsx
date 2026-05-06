import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function ProtectedRoutesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}
