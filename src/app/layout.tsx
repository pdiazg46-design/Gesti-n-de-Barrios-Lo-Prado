import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
    title: "Barrio Seguro | Lo Prado",
    description: "Plataforma de gestión comunitaria y alertas municipales para la comuna de Lo Prado.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="antialiased">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
