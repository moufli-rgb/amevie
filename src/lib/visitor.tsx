import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '@/dashboard/useAuth';

/** Session du visiteur partagée par tout le site (pages publiques + espace visiteur). */
type Ctx = ReturnType<typeof useAuth>;
const VisitorContext = createContext<Ctx | null>(null);

export function VisitorProvider({ children }: { children: ReactNode }) {
  const auth = useAuth('visiteur');
  return <VisitorContext.Provider value={auth}>{children}</VisitorContext.Provider>;
}

export function useVisitor(): Ctx {
  const v = useContext(VisitorContext);
  if (!v) throw new Error('useVisitor doit être utilisé dans <VisitorProvider>');
  return v;
}
