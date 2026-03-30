// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import principal from '@/views/principal.vue' 
import Artistas from '@/views/Artistas.vue'
import Eventos from '@/views/Eventos.vue'

const routes = [
  { path: '/', name: 'principal', component: principal },
  
  // 2. Añadimos la ruta para que el Header la reconozca
  { path: '/artistas', name: 'artistas', component: Artistas },

  { path: '/eventos', name: 'eventos', component: Eventos },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router