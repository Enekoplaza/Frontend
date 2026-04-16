import { createRouter, createWebHistory } from 'vue-router'

// Importamos la vista principal de forma directa (es la primera que se ve)
import Principal from '@/views/Principal.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/principal' 
  },
  { 
    path: '/principal', 
    name: 'principal', 
    component: Principal 
  },
  { 
    path: '/artistas', 
    name: 'artistas', 
    // Lazy loading: solo carga el código de artistas cuando entras
    component: () => import('@/views/Artistas.vue') 
  },
  { 
    path: '/eventos', 
    name: 'eventos', 
    component: () => import('@/views/Eventos.vue') 
  },
  { 
    path: '/perfil', 
    name: 'perfil', 
    component: () => import('@/views/Perfil.vue') 
  },
  // 🚀 AÑADIMOS LA RUTA QUE FALTABA
  { 
    path: '/solicitudes', 
    name: 'solicitudes', 
    component: () => import('@/views/Solicitudes.vue') 
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router