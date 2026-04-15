import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import SessionProvider from "@/components/session-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IssueDesk",
  description: "Campus issue tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} dark`}>
      <body className="min-h-screen bg-[#050812] text-[#eaf2ff]">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}