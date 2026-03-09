import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vine",
    template: "%s | Vine",
  },
  description:
    "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
  metadataBase: new URL("https://vinecms.tech"),
  openGraph: {
    type: "website",
    siteName: "Vine",
    title: "Vine — A simple CMS for your next project",
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
    url: "https://vinecms.tech",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Vine CMS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vine — A simple CMS for your next project",
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.className} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        <ConvexAuthNextjsServerProvider>
          <Providers>{children}</Providers>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
