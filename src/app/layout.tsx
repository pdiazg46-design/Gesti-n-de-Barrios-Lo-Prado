import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "BarrioLoop | Economía Circular de Barrio",
    description: "Convierte el caos de tu grupo de WhatsApp en una comunidad organizada.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className="antialiased">{children}</body>
        </html>
    );
}
