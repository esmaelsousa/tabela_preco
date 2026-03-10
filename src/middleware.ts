import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
    // Protege todas as rotas exceto as públicas (login, api, static assets)
    matcher: ["/((?!api|_next/static|_not-found|_next/image|favicon.ico|login).*)"],
}
