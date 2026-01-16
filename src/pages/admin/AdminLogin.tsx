import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "../../lib/supabase.ts";
import {useAuth} from "../../context/AuthContext.tsx";

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    console.log(auth)
    if(auth.loading) return

    if(auth.accessToken) navigate('/admin/dashboard');
  }, [auth.loading, auth.accessToken, navigate]);


  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const {error} = await supabase.auth.signInWithPassword({email, password});

    if (error) {
      setError(error.message);
    } else {
      navigate('/admin/dashboard');
    }

    setLoading(false);
  }

  return (
    <div className="admin-login">
      <div className="login-container">
        <h1>Panel Administracyjny</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  )
}
