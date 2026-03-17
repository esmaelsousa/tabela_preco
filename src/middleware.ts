// import NextAuth from "next-auth"
// import { authConfig } from "./auth.config"

// export default NextAuth(authConfig).auth

export const config = {
    matcher: [], // Desabilita o matcher
}

export default function middleware() {
    return null;
}
