import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { FileProvider } from "@/context/file-context";
import { Suspense } from "react";
import ErrorPage from "./ErrorPage";
import { Footer } from "@/components/nav/footer";

const inter = Noto_Sans_KR({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "파일 공유",
  description: "간단하게 파일을 공유해보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      {/* bg-tertiary */}
      <body className={`${inter.className}`}>
        <Suspense fallback={<ErrorPage />}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <FileProvider>
                {children}
                <Toaster />
              </FileProvider>
            </AuthProvider>
            <ThemeToggle />
          </ThemeProvider>
        </Suspense>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
