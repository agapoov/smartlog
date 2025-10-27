// Оптимизированные импорты для UI компонентов
export {
	Form,
	Input,
	DatePicker,
	Avatar,
	Badge,
	Tag,
	Button,
	Card,
	Typography,
	Space,
	Alert,
	Modal,
	Select,
	Table,
	Divider,
} from 'antd'

export {
	UserOutlined,
	LockOutlined,
	LoginOutlined,
	LogoutOutlined,
	ExclamationCircleOutlined,
	PaperClipOutlined,
	SendOutlined,
	MoreOutlined,
	ArrowLeftOutlined,
	LoadingOutlined,
} from '@ant-design/icons'

export { AppLayout } from './AppLayout.tsx'

import classNames from 'classnames'

export const cn = (...inputs: classNames.ArgumentArray) => {
	return classNames(inputs)
}
