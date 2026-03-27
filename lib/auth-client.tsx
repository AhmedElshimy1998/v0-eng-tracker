// مسار الملف: lib/auth-client.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import legacyUsers from "@/lib/legacy-users.json"

const AuthContext = createContext<any>(null);

// 1. بديل الـ ClerkProvider عشان ملف layout.tsx يفضل شغال
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        // تطبيق نفس الخدعة في الواجهة
        const userMap = legacyUsers as Record<string, string>;
        const resolvedId = userMap[data.user.email!] || data.user.id;
        
        // تعديل كائن المستخدم عشان يشيل الـ ID المناسب
        setUser({ ...data.user, id: resolvedId });
      } else {
        setUser(null);
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase.auth]);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

// 2. بديل الـ Hooks
export function useUser() {
  const context = useContext(AuthContext);
  return { user: context?.user, isSignedIn: !!context?.user };
}

export function useAuth() {
  const context = useContext(AuthContext);
  return { userId: context?.user?.id, isSignedIn: !!context?.user };
}

// 3. بديل SignedIn و SignedOut
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? <>{children}</> : null;
}