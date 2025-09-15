import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Umili - Біржа умільців",
  description: "Професійна платформа для умільців та замовників",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased font-sans" suppressHydrationWarning={true}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
