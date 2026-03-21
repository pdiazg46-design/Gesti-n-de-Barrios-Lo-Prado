import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Tu Cuenta Segura",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Datos incompletos");
                }

                // Autenticar nativamente contra la bóveda de Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: credentials.email.toLowerCase().trim(),
                    password: credentials.password
                });

                if (error || !data.user) {
                    console.error("Auth Fail:", error?.message);
                    throw new Error("Credenciales inválidas. Verifica tu correo u contraseña.");
                }

                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 365 * 24 * 60 * 60, // 1 año de sesión para PWA
        updateAge: 24 * 60 * 60, // Actualizar token cada 24 hrs
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
    secret: (process.env.NEXTAUTH_SECRET || "lo-prado-secret-2026").trim(),
    debug: true,
    cookies: {
        sessionToken: {
            name: `__Secure-barrio-loop.session-token`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true }
        },
        callbackUrl: {
            name: `__Secure-barrio-loop.callback-url`,
            options: { sameSite: 'lax', path: '/', secure: true }
        },
        csrfToken: {
            name: `__Secure-barrio-loop.csrf-token`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: true }
        },
    }
};

