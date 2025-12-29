'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithOtp: (email: string) => Promise<{ error: any }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithOtp: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking auth session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    if (!supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signInWithOtp = async (email: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    })
    return { error }
  }

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    })
    return { error }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithOtp, signInWithPassword, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
