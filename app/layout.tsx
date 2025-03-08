import type { Metadata } from "next";
import { Roboto } from "next/font/google";
// css
import "./globals.css";
// components
import Navbar from "@/components/sections/navbar/default";
//
import ClientProvider from "./client-provider";

const acme = Roboto({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Quizzy",
  description: "A simple quiz app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${acme.className} dark flex min-h-screen flex-col font-regular antialiased`}
      >
        <ClientProvider>
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <main>{children}</main>
            
          </div>
        </ClientProvider>
      </body>
    </html>
  );
}
