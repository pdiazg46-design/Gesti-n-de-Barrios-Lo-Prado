import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    // Removemos el adaptador para asegurar el login. 
    // Los perfiles se crearán bajo demanda en la App.
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
});

export { handler as GET, handler as POST };
