import NextAuth from "next-auth"
import Cognito from "next-auth/providers/cognito"
import Instagram from "next-auth/providers/instagram"
import Twitter from "next-auth/providers/twitter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Cognito, Instagram, Twitter],
  callbacks: {
    authorized: async ({ auth, request }) => {
      console.log("authorized", auth)
      const url = request.nextUrl
      if (url.pathname.includes("/api/auth")) {
        return true
      }
      return !!auth
    }
  }
})