import { createContext } from 'react';

export type AuthStatus = 'error' | 'signed-in' | 'signed-out' | 'signing-in';

export interface AuthState {
  accessToken: string | undefined;
  error: string | undefined;
  signIn: () => Promise<string | undefined>;
  signOut: () => Promise<void>;
  status: AuthStatus;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
