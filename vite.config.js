import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite' // <-- Añadimos loadEnv aquí
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Cambiamos a una función que recibe el 'mode' (development o production)
export default defineConfig(({ mode }) => {
  // Cargamos las variables del .env correspondiente
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // 1. AÑADIMOS LA RUTA BASE DINÁMICA
    base: env.VITE_BASE_URL || '/',

    // 2. Mantenemos tus plugins intactos
    plugins: [
      vue(),
      vueDevTools(),
    ],

    // 3. Mantenemos tu configuración de alias intacta
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
  open: true
},
  }
})
