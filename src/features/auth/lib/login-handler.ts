import { message } from 'antd'
import { urlUtils } from '@/shared/lib'
import type { LoginFormData } from '../model/types'

interface LoginHandlerParams {
	values: LoginFormData
	mutateAsync: (data: { username: string; password: string }) => Promise<any>
	navigate: (options: { to: string }) => void
}

/**
 * Обработчик логина с навигацией на referrer или главную страницу
 */
export const handleLogin = async ({ values, mutateAsync, navigate }: LoginHandlerParams) => {
	try {
		// Выполняем аутентификацию
		await mutateAsync({
			username: values.username,
			password: values.password,
		})

		// Имитируем успешный логин (в реальном приложении здесь будет проверка credentials)
		if (values.username && values.password) {
			message.success('Вход выполнен успешно!')

			// Получаем referrer URL и проверяем домен
			const referrerUrl = urlUtils.getReferrerUrl()

			if (referrerUrl && urlUtils.isSameDomain(referrerUrl)) {
				// Редиректим на referrer URL если он в том же домене
				window.location.href = referrerUrl
			} else {
				// Редиректим на главную страницу
				navigate({ to: '/' })
			}
		} else {
			message.error('Неверные учетные данные')
		}
	} catch (error) {
		message.error('Произошла ошибка при входе')
	}
}

/**
 * Обработчик ошибок формы
 */
export const handleFormFailed = () => {
	message.error('Пожалуйста, заполните все обязательные поля')
}
