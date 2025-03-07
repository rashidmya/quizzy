import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const acme = Roboto({
  subsets: ['latin'],
  weight: '400'
});

export const metadata: Metadata = {
  title: 'Quizzy',
  description: 'A simple quiz app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${acme.className} dark`}>
        {children}
      </body>
    </html>
  );
}
