import axios from 'axios'

// Базовый клиент без аутентификации
export const $host = axios.create({
	baseURL: import.meta.env.VITE_APP_URL,
	withCredentials: false,
})

// Общий перехватчик ошибок для всех запросов
$host.interceptors.response.use(
	(response) => response,
	(error) => {
		const modifiedError = error
		let errorMessage = 'Произошла неизвестная ошибка'

		if (error.response?.data?.details) {
			errorMessage = error.response.data.details
		}
		if (error.response?.data?.detail) {
			errorMessage = error.response.data.detail
		}

		modifiedError.message = errorMessage
		throw modifiedError
	},
)
