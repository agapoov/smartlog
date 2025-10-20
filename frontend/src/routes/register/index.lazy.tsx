import { RegisterForm } from '@/widgets/register-form'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/register/')({
	component: Page,
})

function Page() {
	return <RegisterForm />
}
