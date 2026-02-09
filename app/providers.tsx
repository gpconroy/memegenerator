"use client";

import { db } from "@/lib/db";

export function Providers({ children }: { children: React.ReactNode }) {
  // InstantDB provider is handled globally via db.init()
  return <>{children}</>;
}
