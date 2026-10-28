'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getSigninSchema } from './signin-schema';
import { AuthService } from '@/services/auth.service';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, LoaderCircle, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: true,
    },
  });

  // Redirigir si ya tiene token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) navigate('/store-inventory/dashboard');
  }, [navigate]);

  async function onSubmit(values) {
    try {
      setIsProcessing(true);
      setError(null);

      const { token } = await AuthService.login(values.username, values.password);
      localStorage.setItem('token', token);

      const nextPath = searchParams.get('next') || '/store-inventory/dashboard';
      navigate(nextPath);
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña inválidos.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="block w-full space-y-5">
        {/* ENCABEZADO */}
        <div className="text-center space-y-1 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenido nuevamente, ingresa tus credenciales.
          </p>
        </div>

        {/* ALERTA DE ERROR */}
        {error && (
          <Alert variant="destructive" appearance="light">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {/* USUARIO */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese su usuario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CONTRASEÑA */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Contraseña</FormLabel>
              </div>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="Ingrese su contraseña"
                    type={passwordVisible ? 'text' : 'password'}
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* RECORDARME */}
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Recordarme
                  </FormLabel>
                </div>
                <Link
                  to="#"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </FormItem>
          )}
        />

        {/* BOTÓN */}
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Verificando...
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </Button>

        {/* PIE */}
        <div className="text-center text-sm text-muted-foreground">
          ¿Aún no tienes una cuenta?{' '}
          <Link
            to="#"
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Contáctanos
          </Link>
        </div>
      </form>
    </Form>
  );
}
