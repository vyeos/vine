"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </ConvexAuthNextjsProvider>
  );
}
