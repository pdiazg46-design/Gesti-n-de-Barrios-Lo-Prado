import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Patrón "Salida de Emergencia" (Manual Logout)
 * Especial para entornos Vercel donde las cookies de Auth.js
 * a veces quedan huérfanas después de un signout estándar.
 */
export async function GET(request: Request) {
    const cookieStore = await cookies();
    const url = new URL("/", request.url);
    const response = NextResponse.redirect(url);

    // Lista de cookies conocidas de Auth.js y NextAuth
    const authCookies = [
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
        "authjs.csrf-token",
        "next-auth.csrf-token",
        "next-auth.callback-url",
        "__Secure-next-auth.callback-url",
        "authjs.state",
        "__Secure-authjs.state"
    ];

    // Borrado explícito de cookies conocidas
    authCookies.forEach((cookieName) => {
        response.cookies.set(cookieName, "", {
            path: "/",
            expires: new Date(0),
            secure: true,
            sameSite: "lax"
        });
    });

    // Borrado agresivo de todo lo demás que pueda existir en el store
    cookieStore.getAll().forEach((cookie) => {
        response.cookies.delete(cookie.name);
    });

    return response;
}
