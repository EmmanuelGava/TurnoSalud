
'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/auth/login');
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente."});
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ title: "Error", description: "No se pudo cerrar la sesión.", variant: "destructive"});
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user and redirecting if successful
      // For new Google users, they will be redirected to the dashboard.
      // We might want to check if it's a new user and guide them to complete their pharmacy profile.
      // This can be handled in the dashboard or profile page.
      router.push('/admin/farmacia/dashboard');
      toast({ title: "Inicio de sesión con Google exitoso", description: "Bienvenido/a."});
    } catch (error: any) {
      console.error("Error signing in with Google: ", error);
      toast({
        title: "Error con Google",
        description: error.message || "No se pudo iniciar sesión con Google. Intenta de nuevo.",
        variant: "destructive",
      });
      setLoading(false);
    }
    // setLoading(false) will be called by onAuthStateChanged listener
  };


  return (
    <AuthContext.Provider value={{ user, loading, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

