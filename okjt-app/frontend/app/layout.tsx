import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({

  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiUrl}/settings`, { next: { revalidate: 60 } });
    const settingsByGroup = await response.json();
    const allSettings = Object.values(settingsByGroup).flat() as any[];
    const favicon = allSettings.find(s => s.key === 'favicon')?.value;
    
    return {
      title: "OKJTech — Design-led Web Engineering",
      description: "Design-centered, user-first web experiences that are fast, responsive, and built to drive results. Custom web apps, UI/UX design, and digital strategy from Nairobi, Kenya.",
      keywords: "web development, web design, OKJTech, Kenya, Nairobi, responsive design, UI/UX, frontend development, backend development, full stack developer, portfolio, Next.js, Laravel",
      authors: [{ name: "OKJTech" }],
      openGraph: {
        title: "OKJTech — Design-led Web Engineering",
        description: "Design-centered, user-first web experiences that are fast, responsive, and built to drive results.",
        siteName: "OKJTech",
        type: "website",
        url: "https://okjtech.co.ke",
      },
      twitter: {
        card: "summary_large_image",
        title: "OKJTech — Design-led Web Engineering",
        description: "Design-centered, user-first web experiences that are fast, responsive, and built to drive results.",
      },
      icons: {
        icon: favicon || '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png',
        apple: favicon || '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png',
      },
    };
  } catch (error) {
    return {
      title: "OKJTech — Design-led Web Engineering",
      description: "Design-centered, user-first web experiences that are fast, responsive, and built to drive results.",
      icons: {
        icon: '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png',
        apple: '/logos/OKJT-Logos/OKJTechLogo-Black_BG-favicon.png',
      },
    };
  }
}

import PrelaunchWrapper from "@/components/PrelaunchWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let maintenanceSettings = null;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiUrl}/site-settings/maintenance`, { next: { revalidate: 60 } });
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      maintenanceSettings = await response.json();
    } else {
      console.warn(`Maintenance settings API returned non-JSON response or status ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to fetch maintenance settings in RootLayout:', error);
  }
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "OKJTech",
              "image": "https://okjtech.co.ke/logos/OKJT-Logos/OKJTechLogo-Black_Transparent.png",
              "url": "https://okjtech.co.ke",
              "telephone": "+254 700 000 000",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Nairobi",
                "addressLocality": "Nairobi",
                "addressCountry": "KE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -1.286389,
                "longitude": 36.817223
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "09:00",
                "closes": "18:00"
              },
              "sameAs": [
                "https://linkedin.com/company/okjtech",
                "https://twitter.com/okjtech",
                "https://github.com/okjtech"
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PrelaunchWrapper launchSettings={maintenanceSettings}>
              <ClientLayout>
                <main id="content">
                  {children}
                </main>
                <Toaster />
              </ClientLayout>
            </PrelaunchWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
