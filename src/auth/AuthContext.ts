import { createContext } from "react";

type AuthContextType = {
  user: any; // luego lo mejoramos
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
