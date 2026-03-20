import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { InstallPrompt } from "@/components/InstallPrompt";

export const viewport: Viewport = {
    themeColor: "#4f46e5",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1, // Previene zoom accidental en inputs móviles
};

export const metadata: Metadata = {
    title: "Barrio Seguro | Lo Prado",
    description: "Plataforma de gestión comunitaria y alertas municipales para la comuna de Lo Prado.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Barrio Seguro",
    },
    icons: {
        apple: "/images/app-icon.png",
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="antialiased selection:bg-indigo-500/30">
                <AuthProvider>
                    {children}
                    <InstallPrompt />
                </AuthProvider>
            </body>
        </html>
    );
}
