<script setup>
import { apiFetch } from '@/services/apiFetch'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AuthModal from './components/AuthModal.vue'

// --- AUTENTICACIÓN ---
const mostrarModal = ref(false)
const usuarioActivo = ref(null)
const router = useRouter()

// Cargar usuario desde localStorage al arrancar
const cargarSesionLocal = () => {
  const usuarioGuardado = localStorage.getItem('usuarioLakobra')
  if (usuarioGuardado) {
    try {
      usuarioActivo.value = JSON.parse(usuarioGuardado)
    } catch (e) {
      console.error('Error parseando usuario guardado', e)
      localStorage.removeItem('usuarioLakobra')
    }
  }
}

// Verificar sesión en backend y RELLENAR DATOS
const verificarSesion = async () => {
  try {
    // 2. USAMOS APIFETCH DIRECTAMENTE (Mucho más limpio, ya hace el res.json y manda credenciales)
    const data = await apiFetch('check_sesion.php')

    if (data.logged_in) {
      const datosUsuario = { 
        id: data.id,
        nombre: data.nombre, 
        dni: data.dni,
        email: data.email,
        direccion: data.direccion,
        rol: data.rol,
        solicitudTxandalari: data.solicitud_txandalari || 0,
        qr_token: data.qr_token
      }
      usuarioActivo.value = datosUsuario
      localStorage.setItem('usuarioLakobra', JSON.stringify(datosUsuario))
    } else {
      usuarioActivo.value = null
      localStorage.removeItem('usuarioLakobra')
    }
  } catch (e) {
    console.error('Error verificando sesión', e)
    usuarioActivo.value = null
  }
}

// Login exitoso
const loginExitoso = async () => {
  await verificarSesion() 
  mostrarModal.value = false
  router.push('/principal')
}

// Cerrar sesión
const cerrarSesion = async () => {
  try {
    // 3. OTRA VEZ APIFETCH (Solo le pasamos el nombre del archivo PHP)
    await apiFetch('logout.php')
    
    usuarioActivo.value = null
    localStorage.removeItem('usuarioLakobra')
    router.push('/principal')
  } catch (e) {
    console.error('Error al cerrar sesión', e)
  }
}

// --- MONTADO ---
onMounted(() => {
  cargarSesionLocal()
  verificarSesion()
})

// --- MODO OSCURO ---
const modoOscuro = ref(true)

onMounted(() => {
  const temaGuardado = localStorage.getItem('modoOscuro')
  if (temaGuardado !== null) {
    modoOscuro.value = temaGuardado === 'true'
  }
})

function toggleModo() {
  if (!document.startViewTransition) {
    modoOscuro.value = !modoOscuro.value;
    localStorage.setItem('modoOscuro', modoOscuro.value);
    return;
  }

  document.startViewTransition(() => {
    modoOscuro.value = !modoOscuro.value;
    localStorage.setItem('modoOscuro', modoOscuro.value);
  });
}
</script>

<template>
  <div class="app-container" :class="modoOscuro ? 'dark' : 'light'">
    <Header
      :usuario="usuarioActivo"
      :modoOscuro="modoOscuro"
      @abrirModal="mostrarModal = true"
      @logout="cerrarSesion"
      @toggleTema="toggleModo"
    />

    <main class="content">
      <router-view :usuario="usuarioActivo" @actualizar-usuario="verificarSesion" />
    </main>

    <Footer
      :usuario="usuarioActivo"
      @abrirModal="mostrarModal = true"
    />

    <AuthModal
      :mostrar="mostrarModal"
      @cerrar="mostrarModal = false"
      @logeado="loginExitoso"
    />
  </div>
</template>

<style scoped>
.app-container.light {
  --fondo: #f8fafc;
  --texto: #334155;
  --titulo: #0f172a;
  --boton-bg: #38bdf8;
  --boton-texto: #0f172a;
  --boton-hover: #7dd3fc;
}

.app-container.dark {
  --fondo: #0f172a;
  --texto: #cbd5e1;
  --titulo: #f8fafc;
  --boton-bg: #38bdf8;
  --boton-texto: #0f172a;
  --boton-hover: #7dd3fc;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: var(--fondo);
  color: var(--texto);
}

.content {
  flex: 1;
  padding: 40px 20px;
}
</style>

<style>
/* =========================================
   ANIMACIÓN DE BARRIDO (VIEW TRANSITIONS)
   ========================================= */

::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* La pantalla "vieja" se queda quieta en el fondo */
::view-transition-old(root) {
  z-index: 1;
}

/* La pantalla "nueva" (con el nuevo tema) barre por encima */
::view-transition-new(root) {
  z-index: 2;
  /* Empieza invisible: recortamos el 100% desde la derecha */
  clip-path: inset(0 100% 0 0);
  /* Animación suave de 0.7 segundos */
  animation: barrido-derecha 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* El fotograma clave que hace que la máscara se abra de Izquierda a Derecha */
@keyframes barrido-derecha {
  to {
    /* Termina totalmente visible */
    clip-path: inset(0 0 0 0);
  }
}
</style>