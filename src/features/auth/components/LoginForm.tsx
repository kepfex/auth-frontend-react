import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail } from "lucide-react";

export const LoginForm = () => {
  const { login, isLoading, error } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // conecta Zod con RHF
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data); // data ya está validada por Zod
  };

  return (
    <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-1.5 mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Bienvenido de nuevo
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Accede al sistema con tu cuenta.
        </p>
      </div>

      <FieldGroup className="mb-6">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email" className="uppercase">
                Correo electrónico
              </FieldLabel>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-phoenix-gold transition-colors">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="off"
                  className="placeholder:opacity-40 pl-11 pr-4 py-5 bg-white/50 border border-zinc-300 dark:border-lead-gray"
                />
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password" className="uppercase">Contraseña</FieldLabel>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-phoenix-gold transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <Input
                  {...field}
                  id="login-password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
                  className="placeholder:opacity-40 px-11 pr-4 py-5 bg-white/50 border border-zinc-300 dark:border-lead-gray"
                />
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>


      {/* <div>
        <label>Contraseña</label>
        <input type="password" {...register("password")} />
        {errors.password && (
          <span style={{ color: "red" }}>{errors.password.message}</span>
        )}
      </div> */}

      {/* Error del servidor */}
      {error && <p style={{ color: "red", paddingBottom: "1rem" }}>{error}</p>}

      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full py-5 bg-phoenix-gold hover:bg-phoenix-gold/90 font-bold rounded-xl shadow-lg transition-all duration-300 space-x-2 cursor-pointer transform hover:-translate-y-0.5"
      >
        {isLoading 
          ? (
          <>
            <Loader2 className="animate-spin " /> Ingresando...
          </>
        ) 
          : "Iniciar Sesión"
        }
      </Button>
    </form>
  );
};
