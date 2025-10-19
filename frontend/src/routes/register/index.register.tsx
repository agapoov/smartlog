import { RegisterForm } from '@/widgets/register-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register/index/register')({
	component: Page,
})

function Page() {
	return <RegisterForm />
}
