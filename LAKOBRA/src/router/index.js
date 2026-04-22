import { createRouter, createWebHistory } from 'vue-router'

// Importamos la vista principal de forma directa (es la primera que se ve)
import Principal from '@/views/principal.vue'

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
    component: () => import('@/views/artistas.vue') 
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
    component: () => import('@/views/solicitudes.vue') 
  },
  {
  path: '/puerta',
  name: 'puerta',
  component: () => import('../views/ControlAcceso.vue')
  },
]

const router = createRouter({
  // 🔴 AQUÍ ESTÁ EL CAMBIO: Le pasamos nuestra variable de entorno VITE_BASE_URL
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes
})

export default router