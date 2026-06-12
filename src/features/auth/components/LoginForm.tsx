import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const { login, isLoading, error } = useLogin();

  const {
    register, // conecta inputs al form
    handleSubmit, // maneja el submit con validación
    formState: { errors }, // errores de validación
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // conecta Zod con RHF
  });

  const onSubmit = (data: LoginFormData) => {
    login(data); // data ya está validada por Zod
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div>
        <label>Email</label>
        <input type="email" {...register("email")} />
        {errors.email && (
          <span style={{ color: "red" }}>{errors.email.message}</span>
        )}
      </div>

      <div>
        <label>Contraseña</label>
        <input type="password" {...register("password")} />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password.message}</span>
        )}
      </div>

      {/* Error del servidor */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Button type="submit" size="sm" disabled={isLoading}>
        {isLoading ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
};
