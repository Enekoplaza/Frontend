<script setup>
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
    const res = await fetch('http://localhost/Backend/check_sesion.php', {
      credentials: 'include'
    })
    const data = await res.json()

    if (data.logged_in) {
      // MAPEAREMOS EXACTAMENTE LOS NOMBRES DE TU BBDD
      const datosUsuario = { 
        id: data.id,
        nombre: data.nombre, 
        dni: data.dni,           // <--- IMPORTANTE: Asegúrate que el PHP mande 'dni'
        email: data.email,       // <--- IMPORTANTE: Asegúrate que el PHP mande 'email'
        direccion: data.direccion, // <--- IMPORTANTE: Asegúrate que el PHP mande 'direccion'
        rol: data.rol,
        solicitudTxandalari: data.solicitud_txandalari || 0 
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
  await verificarSesion() // <--- Descarga el perfil COMPLETO desde PHP
  mostrarModal.value = false
}

// Cerrar sesión
const cerrarSesion = async () => {
  try {
    await fetch('http://localhost/Backend/logout.php', { credentials: 'include' })
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
  modoOscuro.value = !modoOscuro.value
  localStorage.setItem('modoOscuro', modoOscuro.value)
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
  transition: background-color 0.4s ease, color 0.4s ease;
}

.content {
  flex: 1;
  padding: 40px 20px;
}
</style>