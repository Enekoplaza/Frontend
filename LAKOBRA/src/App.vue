<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AuthModal from './components/AuthModal.vue'

// --- 1. LÓGICA DE AUTENTICACIÓN ---
const mostrarModal = ref(false);
const usuarioActivo = ref(null);

// NUEVO: Función para cargar los datos instantáneamente desde el navegador
const cargarSesionLocal = () => {
  const usuarioGuardado = localStorage.getItem('usuarioLakobra');
  if (usuarioGuardado) {
    usuarioActivo.value = JSON.parse(usuarioGuardado);
  }
};

const verificarSesion = async () => {
  try {
    const res = await fetch('http://localhost/Backend/check_sesion.php', {
      credentials: 'include'
    });
    const data = await res.json();
    
    if (data.logged_in) {
      const datosUsuario = { nombre: data.nombre, rol: data.rol };
      usuarioActivo.value = datosUsuario;
      // Actualizamos el localStorage por si hubo cambios en el servidor
      localStorage.setItem('usuarioLakobra', JSON.stringify(datosUsuario));
    } else {
      // Si el servidor dice que la sesión expiró, limpiamos todo
      usuarioActivo.value = null;
      localStorage.removeItem('usuarioLakobra');
    }
  } catch (e) {
    console.error("Error verificando sesión");
  }
};

const loginExitoso = (datosUsuario) => {
  usuarioActivo.value = datosUsuario;
  // NUEVO: Guardamos en localStorage al hacer login
  localStorage.setItem('usuarioLakobra', JSON.stringify(datosUsuario));
  mostrarModal.value = false;
};

const cerrarSesion = async () => {
  try {
    await fetch('http://localhost/Backend/logout.php', { credentials: 'include' });
    usuarioActivo.value = null;
    // NUEVO: Borramos los datos del navegador al salir
    localStorage.removeItem('usuarioLakobra');
    location.reload();
  } catch (e) {
    console.error("Error al cerrar sesión");
  }
};

onMounted(() => {
  cargarSesionLocal(); // 1. Carga visual inmediata
  verificarSesion();   // 2. Comprobación de seguridad en segundo plano
});

// --- 2. LÓGICA DE MODO OSCURO ---
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
    <Header :usuario="usuarioActivo" :modoOscuro="modoOscuro" @abrirModal="mostrarModal = true" @logout="cerrarSesion"
      @toggleTema="toggleModo" />

    <main class="content">
      <router-view />
    </main>

    <Footer :usuario="usuarioActivo" @abrirModal="mostrarModal = true" />

    <AuthModal :mostrar="mostrarModal" @cerrar="mostrarModal = false" @logeado="loginExitoso" />
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