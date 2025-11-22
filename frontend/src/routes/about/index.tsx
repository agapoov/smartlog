import { createFileRoute, Link } from '@tanstack/react-router'
import { MainLayout } from '@/shared/ui/MainLayout'

export const Route = createFileRoute('/about/')({
	component: AboutPage,
})

function AboutPage() {
	return (
		<MainLayout>
			<div className="w-full space-y-12">
				{/* Hero */}
				<section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
					<div className="px-8 py-12 sm:px-12 sm:py-16">
						<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">SmartLog — управление грузоперевозками</h1>
						<p className="mt-4 max-w-3xl text-base sm:text-lg opacity-90">
							Создавайте заказы, получайте предложения от перевозчиков, анализируйте цену и сроки, принимайте лучшие
							отклики и ведите коммуникацию в чате. Всё в одном месте.
						</p>
						<div className="mt-8 flex flex-wrap gap-4">
							<Link to="/orders">
								<a className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow hover:shadow-md hover:bg-indigo-50 transition">
									Перейти к заказам
								</a>
							</Link>
							<Link to="/cargo">
								<a className="inline-flex items-center rounded-lg bg-indigo-700/30 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-indigo-700/40 transition">
									Создать груз
								</a>
							</Link>
						</div>
					</div>
				</section>

				{/* Ключевые возможности */}
				<section>
					<h2 className="text-2xl font-bold text-gray-900">Что умеет SmartLog</h2>
					<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
							<div className="text-2xl">📦</div>
							<h3 className="mt-3 text-lg font-semibold">Грузы</h3>
							<p className="mt-2 text-sm text-gray-600">
								Создавайте и управляйте номенклатурой грузов: тип, вес, объём и дополнительные параметры.
							</p>
							<Link to="/cargo">
								<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
									Перейти к грузам →
								</a>
							</Link>
						</div>
						<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
							<div className="text-2xl">📝</div>
							<h3 className="mt-3 text-lg font-semibold">Заказы</h3>
							<p className="mt-2 text-sm text-gray-600">
								Указывайте адреса (например, Белгород → Москва), параметры перевозки, сроки и бюджет.
							</p>
							<Link to="/orders">
								<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
									Список заказов →
								</a>
							</Link>
						</div>
						<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
							<div className="text-2xl">💡</div>
							<h3 className="mt-3 text-lg font-semibold">Предложения перевозчиков</h3>
							<p className="mt-2 text-sm text-gray-600">
								Получайте отклики с ценой, временем доставки, рейтингом и маршрутом. Анализируйте графики по цене и
								коэффициентам.
							</p>
							<Link to="/responses">
								<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
									Отклики и статусы →
								</a>
							</Link>
						</div>
						<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
							<div className="text-2xl">✅</div>
							<h3 className="mt-3 text-lg font-semibold">Принятие отклика</h3>
							<p className="mt-2 text-sm text-gray-600">
								Выбирайте лучшее предложение и фиксируйте договорённость. Статусы: ожидает, принято, отклонено,
								завершено.
							</p>
						</div>
						<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
							<div className="text-2xl">💬</div>
							<h3 className="mt-3 text-lg font-semibold">Чаты и коммуникации</h3>
							<p className="mt-2 text-sm text-gray-600">
								Общайтесь по заказу в реальном времени и держите всю историю переговоров в одном месте.
							</p>
							<Link to="/chat">
								<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
									Открыть чаты →
								</a>
							</Link>
						</div>
						<div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
							<div className="text-2xl">🔐</div>
							<h3 className="mt-3 text-lg font-semibold">Авторизация</h3>
							<p className="mt-2 text-sm text-gray-600">
								Безопасный доступ и управление сессией. При отсутствии токенов доступ перенаправляется на страницу
								входа.
							</p>
						</div>
					</div>
				</section>

				{/* Как это работает */}
				<section>
					<h2 className="text-2xl font-bold text-gray-900">Как это работает</h2>
					<ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 px-1">
						<li className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
							<span className="text-sm font-semibold text-indigo-600">Шаг 1</span>
							<p className="mt-2 text-gray-800">Создайте груз и заказ, указав адреса, параметры и сроки.</p>
						</li>
						<li className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
							<span className="text-sm font-semibold text-indigo-600">Шаг 2</span>
							<p className="mt-2 text-gray-800">Получите отклики перевозчиков с ценой, рейтингом и маршрутом.</p>
						</li>
						<li className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
							<span className="text-sm font-semibold text-indigo-600">Шаг 3</span>
							<p className="mt-2 text-gray-800">Сравните предложения по графикам цены и коэффициентов.</p>
						</li>
						<li className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
							<span className="text-sm font-semibold text-indigo-600">Шаг 4</span>
							<p className="mt-2 text-gray-800">Примите отклик и зафиксируйте договорённость по заказу.</p>
						</li>
						<li className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
							<span className="text-sm font-semibold text-indigo-600">Шаг 5</span>
							<p className="mt-2 text-gray-800">Ведите коммуникацию в чате и отслеживайте статусы выполнения.</p>
						</li>
						<li className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
							<span className="text-sm font-semibold text-indigo-600">Шаг 6</span>
							<p className="mt-2 text-gray-800">Поддерживайте актуальность данных по грузам и заказам.</p>
						</li>
					</ol>
				</section>

				{/* CTA */}
				<section className="rounded-2xl bg-indigo-50 p-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h3 className="text-xl font-bold text-gray-900">Начните с заказа или добавления груза</h3>
							<p className="mt-1 text-gray-700">Выберите следующий шаг — система подскажет дальнейшие действия.</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link to="/orders">
								<a className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition">
									К заказам
								</a>
							</Link>
							<Link to="/responses">
								<a className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 shadow hover:bg-indigo-50 transition">
									К откликам
								</a>
							</Link>
						</div>
					</div>
				</section>
			</div>
		</MainLayout>
	)
}
