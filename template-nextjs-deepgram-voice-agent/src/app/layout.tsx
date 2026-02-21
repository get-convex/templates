import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from 'react-hot-toast'
import { Analytics } from "@vercel/analytics/next"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kollect Voice Agent",
  description: "Kollect is a Real-time voice survey platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

     <ClerkProvider 
        
     dynamic>
      <ConvexClientProvider>
   
  
    <html lang="en">
   
      <body className={notoSans.className}>
         <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '1.2rem',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
        {children}
          <Analytics mode="production" />
      </body>
    </html>

    </ConvexClientProvider>
        </ClerkProvider>
  );
}
