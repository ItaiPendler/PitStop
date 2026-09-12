import { createContext } from 'react';

export enum AuthStatus {
  Error = 'error',
  Restoring = 'restoring',
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
  SigningIn = 'signing-in',
}

export interface AuthState {
  accessToken: string | undefined;
  error: string | undefined;
  signIn: () => Promise<string | undefined>;
  signOut: () => Promise<void>;
  status: AuthStatus;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
