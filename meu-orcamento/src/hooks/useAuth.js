// src/hooks/useAuth.js
import { useAuth as useAuthContext } from '../context/AuthContext';

// Este hook é um alias para facilitar a importação
export const useAuth = () => {
  return useAuthContext();
};