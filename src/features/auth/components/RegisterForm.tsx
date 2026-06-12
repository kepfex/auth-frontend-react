import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema'
import { useRegister } from '../hooks/useAuth'

export const RegisterForm = () => {
  const { register: registerUser, isLoading, error } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    // Excluimos confirmPassword antes de enviar a la API
    const { confirmPassword: _, ...payload } = data
    registerUser(payload)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label>Nombre</label>
        <input type="text" {...register('name')} />
        {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
      </div>

      <div>
        <label>Contraseña</label>
        <input type="password" {...register('password')} />
        {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
      </div>

      <div>
        <label>Confirmar contraseña</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span style={{ color: 'red' }}>{errors.confirmPassword.message}</span>}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  )
}