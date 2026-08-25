import { Link } from 'react-router-dom'
import { RegisterForm } from '../../features/auth/components/RegisterForm'

export const RegisterPage = () => (
  <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
    <h1>Crear cuenta</h1>
    <RegisterForm />
    <p>
      ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
    </p>
  </div>
)