import { z } from 'zod'

// Схемы для валидации данных аутентификации
export const LoginRequestSchema = z.object({
	username: z.string().min(1, 'Имя пользователя обязательно'),
	password: z.string().min(1, 'Пароль обязателен'),
})

// Схема для формы логина с дополнительной валидацией
export const LoginFormSchema = z.object({
	username: z
		.string()
		.min(1, 'Пожалуйста, введите имя пользователя!')
		.min(3, 'Имя пользователя должно содержать минимум 3 символа'),
	password: z
		.string()
		.min(1, 'Пожалуйста, введите пароль!')
		.min(6, 'Пароль должен содержать минимум 6 символов'),
})

export const TokenResponseSchema = z.object({
	access: z.string(),
	refresh: z.string(),
})

export const RefreshRequestSchema = z.object({
	refresh: z.string(),
})

export const RefreshResponseSchema = z.object({
	access: z.string(),
})

// Типы, выведенные из схем
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type LoginFormData = z.infer<typeof LoginFormSchema>
export type TokenResponse = z.infer<typeof TokenResponseSchema>
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>
