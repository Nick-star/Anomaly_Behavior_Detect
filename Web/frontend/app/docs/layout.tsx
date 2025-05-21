"use client";

import type React from "react";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { useRouter } from "next/navigation";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <DocsSidebar onBack={handleBack} />
      {children}
    </SidebarProvider>
  );
}
