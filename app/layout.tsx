import type { Metadata } from 'next';
import { Azeret_Mono as GeistMono } from 'next/font/google';
import './globals.css';

const geistMono = GeistMono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo List',
  description: 'A simple todo list application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.className} bg-gray-900 text-gray-200`}>
        {children}
      </body>
    </html>
  );
}
