import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), TanStackRouterVite()],
	resolve: {
		alias: [{ find: '@', replacement: '/src' }],
	},
	build: {
		target: 'esnext',
		minify: 'esbuild',
		cssMinify: true,
		reportCompressedSize: false,
		chunkSizeWarningLimit: 1000,
		emptyOutDir: true,
		sourcemap: false,
		rollupOptions: {
			treeshake: 'recommended',
			output: {
				manualChunks: {
					'react-core': ['react', 'react-dom'],
					router: ['@tanstack/react-router'],
					query: ['@tanstack/react-query'],
					ui: ['antd'],
					animation: ['framer-motion'],
					state: ['mobx', 'mobx-react-lite'],
					utils: ['axios', 'zod'],
				},
				chunkFileNames: 'js/[name].[hash].js',
				entryFileNames: 'js/[name].[hash].js',
				assetFileNames: ({ name }) => {
					if (/\.(css)$/.test(name ?? '')) {
						return 'css/[name].[hash][extname]'
					}
					return 'assets/[name].[hash][extname]'
				},
				compact: true,
				minifyInternalExports: true,
			},
		},
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'@tanstack/react-router',
			'@tanstack/react-query',
			'antd',
			'framer-motion',
			'mobx',
			'axios',
		],
		exclude: ['@vitejs/plugin-react'],
		esbuildOptions: {
			target: 'esnext',
			treeShaking: true,
		},
	},
	esbuild: {
		target: 'esnext',
		treeShaking: true,
		minifyIdentifiers: true,
		minifySyntax: true,
		minifyWhitespace: true,
	},
})
