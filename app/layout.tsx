import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AI Prep | Master Your Knowledge",
    description: "Advanced AI-powered evaluation and learning platform",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
            suppressHydrationWarning
            style={{ colorScheme: "dark" }}
        >
        <body className="min-h-full bg-[#030712] text-slate-50 selection:bg-indigo-500/30">
        {/* Modern Background Mesh/Gradient */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
            <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[60%] rounded-full bg-blue-500/10 blur-[120px]" />

            {/* Subtle Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 48L54 60M6 48L6 60M30 48L30 60M48 54L60 54M48 6L60 6M48 30L60 30M0 54L12 54M0 6L12 6M0 30L12 30M30 0L30 12M6 0L6 12M54 0L54 12M0 0h60v60H0z' fill='white' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                }}
            />
        </div>

        <main className="relative flex min-h-screen flex-col">
            {/* We can inject a Navbar here in the future */}
            <div className="flex-1">
                {children}
            </div>

            <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
                <p>© {new Date().getFullYear()} AI Prep. Built for Excellence.</p>
            </footer>
        </main>
        </body>
        </html>
    );
}