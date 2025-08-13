import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Noto_Sans, PT_Sans } from 'next/font/google'
import { cn } from '@/lib/utils';


export const metadata: Metadata = {
  title: 'बातमी संपादक (Batami Sampadak)',
  description: 'AI-powered news script editor and headline generator.',
};

const fontHeadline = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
});

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "font-body antialiased",
          fontHeadline.variable,
          fontBody.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
