import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {type ReactNode} from "react";

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Ładowanie...</div>
  }

  if (!user) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
