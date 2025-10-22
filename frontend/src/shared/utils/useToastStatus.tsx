import type { MutationStatus } from '@tanstack/react-query'
import { message } from 'antd'
import { useEffect } from 'react'

interface IUseToastStatusProps {
	status?: MutationStatus
	isPending?: boolean
	isSuccess?: boolean
	isError?: boolean
	errorMsg?: string | Error | null
	loadingMsg?: string
	successMsg?: string
}

const useToastStatus = ({
	status,
	isPending,
	isSuccess,
	isError,
	errorMsg,
	loadingMsg,
	successMsg,
}: IUseToastStatusProps) => {
	const messageContent = {
		pending: () => message.loading('Обновление ' + (loadingMsg || 'Синхронизация данных, подождите')),
		success: () =>
			message.success(
				'Успешно! ' + (successMsg || 'Запрос выполнен успешно! Все данные отправленны и обработаны корректно.'),
			),
		error: () =>
			message.error(
				'Ошибка! ' +
					((typeof errorMsg === 'string' ? errorMsg : errorMsg?.message) ||
						'При запросе произошла ошибка! Повторите позже'),
			),
	}
	useEffect(() => {
		message.destroy()

		if (status) {
			if (status === 'pending') messageContent.pending()
			if (status === 'success') messageContent.success()
			if (status === 'error') messageContent.error()
		} else {
			if (isPending) messageContent.pending()
			if (isSuccess) messageContent.success()
			if (isError) messageContent.error()
		}
	}, [status, isPending, isSuccess, isError, loadingMsg, successMsg, errorMsg])
}

export default useToastStatus
