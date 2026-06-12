import { Link } from 'react-router-dom'
import { LoginForm } from '../features/auth/components/LoginForm'

export const LoginPage = () => (
  <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
    <h1>Iniciar sesión</h1>
    <LoginForm />
    <p>
      ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
    </p>
  </div>
)
