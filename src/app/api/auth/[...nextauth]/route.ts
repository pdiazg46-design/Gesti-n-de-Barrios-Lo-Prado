import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            // Limpiamos posibles espacios invisibles que rompen la conexión
            clientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
        }),
    ],
    session: {
        strategy: "jwt",
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
