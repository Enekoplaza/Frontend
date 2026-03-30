import { createRouter, createWebHistory } from 'vue-router'
import principal from '@/views/principal.vue'
import Artistas from '@/views/artistas.vue'
import Eventos from '@/views/Eventos.vue'
import Perfil from '@/views/Perfil.vue'  // <-- Importa tu vista de perfil

const routes = [
  { path: '/', name: 'principal', component: principal },
  { path: '/artistas', name: 'artistas', component: Artistas },
  { path: '/eventos', name: 'eventos', component: Eventos },
  { path: '/perfil', name: 'perfil', component: Perfil }, // <-- Ruta perfil
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router