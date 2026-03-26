<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import AuthModal from './components/AuthModal.vue'

const mostrarModal = ref(false);
const usuarioActivo = ref(null);

const verificarSesion = async () => {
  try {
    const res = await fetch('http://localhost/Backend/check_sesion.php', {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.logged_in) {
      // ERROR: Antes decia usuario.value, corregido a usuarioActivo.value
      usuarioActivo.value = { nombre: data.nombre, rol: data.rol };
    }
  } catch (e) {
    console.error("Error verificando sesión");
  }
};

const loginExitoso = (datosUsuario) => {
  usuarioActivo.value = datosUsuario; // ERROR corregido
  mostrarModal.value = false;
};

const cerrarSesion = async () => {
  try {
    await fetch('http://localhost/Backend/logout.php', { credentials: 'include' });
    usuarioActivo.value = null;
    location.reload();
  } catch (e) {
    console.error("Error al cerrar sesión");
  }
};

onMounted(verificarSesion);
</script>

<template>
  <div class="app-container">
    <Header :usuario="usuarioActivo" @abrirModal="mostrarModal = true" @logout="cerrarSesion" />

    <main class="content">
      <router-view />
    </main>

    <Footer :usuario="usuarioActivo" @abrirModal="mostrarModal = true" />

    <AuthModal :mostrar="mostrarModal" @cerrar="mostrarModal = false" @logeado="loginExitoso" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.content {
  flex: 1;
  padding: 40px 20px;
}
</style>