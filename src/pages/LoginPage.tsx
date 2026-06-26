import { Link } from "react-router-dom";
import { LoginForm } from "../features/auth/components/LoginForm";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const LoginPage = () => (
  <>
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-background">
      <span className="font-bold text-lg">Mi App</span>

      <div className="flex items-center gap-3">
        {/* otros elementos del navbar */}
        <ThemeToggle />
      </div>
    </nav>
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Iniciar sesión</h1>
      <LoginForm />
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  </>
);
