import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wizroll - WhatsApp Community Link Manager",
    template: "%s | Wizroll",
  },
  description:
    "Create smart public join links that automatically roll over between WhatsApp community invite links when groups fill up.",
  keywords: [
    "WhatsApp",
    "community",
    "invite link",
    "group management",
    "link rollover",
    "WhatsApp groups",
  ],
  authors: [{ name: "Wizroll" }],
  creator: "Wizroll",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Wizroll",
    title: "Wizroll - WhatsApp Community Link Manager",
    description:
      "Create smart public join links that automatically roll over between WhatsApp community invite links when groups fill up.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wizroll - WhatsApp Community Link Manager",
    description:
      "Create smart public join links that automatically roll over between WhatsApp community invite links when groups fill up.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={raleway.variable}>
      <head>
        <meta name="apple-mobile-web-app-title" content="WizRoll" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
