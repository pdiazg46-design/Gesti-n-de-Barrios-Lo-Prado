import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AppLock } from "@/components/AppLock";

export const viewport: Viewport = {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1, // Previene zoom accidental en inputs móviles
};

export const metadata: Metadata = {
    title: "Barrio Seguro | Lo Prado",
    description: "Plataforma de gestión comunitaria y alertas municipales para la comuna de Lo Prado.",
    manifest: "/manifest.json?v=3",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Barrio Seguro",
    },
    icons: {
        icon: "/images/app-icon.png?v=5",
        apple: "/images/app-icon.png?v=5",
    }
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            if ('serviceWorker' in navigator) {
                                window.addEventListener('load', function() {
                                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                                        console.log('ServiceWorker PWA Active:', registration.scope);
                                    }, function(err) {
                                        console.log('ServiceWorker PWA Falló:', err);
                                    });
                                });
                            }
                        `,
                    }}
                />
            </head>
            <body className="antialiased selection:bg-indigo-500/30">
                <AuthProvider>
                    <AppLock>
                        {children}
                        <InstallPrompt />
                    </AppLock>
                </AuthProvider>
            </body>
        </html>
    );
}
