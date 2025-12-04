import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClientLayout } from "./ClientLayout";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WellSmart SCADA Dashboard",
  description: "Real-time industrial process monitoring with offline-first capabilities",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WellSmart",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark" style={{ backgroundColor: '#0a0a0a', colorScheme: 'dark' }}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.backgroundColor = '#ffffff';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#0a0a0a';
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.backgroundColor = '#0a0a0a';
                }
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#0d6efd" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WellSmart" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
