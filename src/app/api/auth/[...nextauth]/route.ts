import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// [Simplificador Técnico] Inyección en tiempo de ejecución para Vercel Lambdas
if (!process.env.NEXTAUTH_URL && process.env.VERCEL) {
    process.env.NEXTAUTH_URL = "https://lo-prado.vercel.app";
} else if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = "https://lo-prado.vercel.app";
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
