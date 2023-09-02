import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { join, resolve } from "path"
// import Components from 'unplugin-vue-components/vite'
// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': join(__dirname, '.'),
		}
	},
	server:{
		port:1314,
		// 选项写法
		proxy:{
			'/pag': {
				target: 'https://cdn.tmui.design',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '/api')
			},
		}
	},
	build: {
		watch: {
			chokidar: {
				ignored: ['!**/node_modules/@melkor/**/*']
			}
		}
	},
	plugins: [
		uni(),
	],
});
