import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { cn } from '@/lib/utils';


export const metadata: Metadata = {
  title: 'बातमी संपादक (Batami Sampadak)',
  description: 'AI-powered news script editor and headline generator.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-body: 'PT Sans';
                --font-headline: 'Noto Sans';
              }
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body 
        className={cn(
          "font-body antialiased"
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
