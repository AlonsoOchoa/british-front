import { z } from 'zod';

export function getSigninSchema() {
  return z.object({
    username: z.string().min(1, 'Ingrese su usuario'),
    password: z.string().min(1, 'Ingrese su contraseña'),
  });
}
