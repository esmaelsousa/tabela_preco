import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth }) {
            // LOGIN DESABILITADO TEMPORARIAMENTE PARA ACESSO DIRETO
            return true
        },
    },
    providers: [], // Provedores serão adicionados no auth.ts (server-side)
} satisfies NextAuthConfig
