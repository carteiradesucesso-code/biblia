import NextAuth from 'next-auth'
import type { NextAuthOptions, Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // Find or create user by email
        let user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          // Create a new user if not found (simple auth for demo)
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
            },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
}

const handler = NextAuth(authOptions)

// Export auth function for use in API routes
export async function auth(): Promise<Session | null> {
  // In server components/API routes, we need to get the session differently
  // This is a simplified version - in production you'd use getServerSession
  return null
}

export { handler as GET, handler as POST }
