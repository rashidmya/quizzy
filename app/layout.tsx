import type { Metadata } from "next";
import { Roboto } from "next/font/google";
// css
import "./globals.css";
//
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NotistackProvider } from "@/components/providers/notistack-provider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
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
        className={`${roboto.className} flex min-h-screen flex-col font-regular antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NotistackProvider>
              <div className="flex min-h-screen w-full flex-col">
                <main>{children}</main>
              </div>
            </NotistackProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
