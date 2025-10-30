import { z } from 'zod';

export const signupSchema = z.object({
  login: z
    .string()
    .min(3, 'Логин должен быть минимум 3 символа')
    .refine(
      (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?\d{10,15}$/;
        return emailRegex.test(val) || phoneRegex.test(val);
      },
      { message: 'Логин должен быть валидным email или номером телефона' },
    ),
  password: z.string().min(6, 'Пароль должен быть минимум 6 символов').max(32),
});
