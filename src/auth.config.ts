import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = !nextUrl.pathname.startsWith("/login")

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redireciona para login
            } else if (isLoggedIn) {
                return Response.redirect(new URL("/", nextUrl))
            }
            return true
        },
    },
    providers: [], // Provedores serão adicionados no auth.ts (server-side)
} satisfies NextAuthConfig
