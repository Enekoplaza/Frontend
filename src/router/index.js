import { createRouter, createWebHistory } from 'vue-router'
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
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes
})

// --- 🛡️ GUARDIA DE SEGURIDAD (Paso 2) ---
router.beforeEach((to, from, next) => {
  // 1. Obtenemos el usuario del localStorage
  const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLakobra') || 'null')
  
  // 2. Definimos qué rutas son públicas para todo el mundo
  // La ruta '/puerta' es pública para que el invitado pueda cargar el componente
  const rutasPublicas = ['/principal', '/artistas', '/puerta', '/eventos']
  const esRutaPublica = rutasPublicas.includes(to.path)

  // 3. Caso: Usuario NO logueado intenta entrar a una ruta privada (ej: /perfil)
  if (!esRutaPublica && !usuarioLocal) {
    // Si trae el parámetro 'guest' en la URL, le dejamos pasar a la puerta
    if (to.path === '/puerta' && to.query.guest) {
      return next()
    }
    // Si no, lo mandamos a la principal
    return next('/principal')
  }

  // 4. Caso: Usuario logueado (Socio) intenta entrar a /solicitudes o /puerta
  // Solo Admin y Txandalari pueden entrar en esas
  const rutasPrivadasAdmin = ['/solicitudes', '/puerta']
  if (rutasPrivadasAdmin.includes(to.path)) {
    const esAutorizado = usuarioLocal?.rol === 'admin' || usuarioLocal?.rol === 'txandalari'
    
    // Si es un socio normal intentando entrar a la puerta... a casa.
    // EXCEPCIÓN: Si el socio normal tiene un token 'guest' (poco probable, pero posible), le dejamos.
    if (!esAutorizado && !to.query.guest) {
      return next('/principal')
    }
  }

  // Si todo está ok, adelante
  next()
})

export default router