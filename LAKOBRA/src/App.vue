<template>
  <div :class="['app-container', modoOscuro ? 'dark' : 'light']">
    <Header />
    <router-view /> 
    <Footer />

    <!-- Botón para alternar modo -->
    <button class="toggle-modo" @click="toggleModo">
      {{ modoOscuro ? 'Modo Claro' : 'Modo Oscuro' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// Estado para modo oscuro
const modoOscuro = ref(false)

// Cargar preferencia de localStorage
onMounted(() => {
  const temaGuardado = localStorage.getItem('modoOscuro')
  if (temaGuardado) {
    modoOscuro.value = temaGuardado === 'true'
  }
})

// Alternar modo oscuro
function toggleModo() {
  modoOscuro.value = !modoOscuro.value
  localStorage.setItem('modoOscuro', modoOscuro.value)
}
</script>

<style scoped>

.app-container.light {
  --fondo: #ffffff;
  --texto: #333333;
  --titulo: #222222;
  --boton-bg: #007BFF;
  --boton-texto: #ffffff;
  --boton-hover: #0056b3;
}


.app-container.dark {
  --fondo: #121212;
  --texto: #dddddd;
  --titulo: #ffffff;
  --boton-bg: #1e88e5;
  --boton-texto: #ffffff;
  --boton-hover: #1565c0;
}


.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: var(--fondo);
  color: var(--texto);
  transition: background-color 0.3s, color 0.3s;
}


.toggle-modo {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: var(--boton-bg);
  color: var(--boton-texto);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 1000;
}

.toggle-modo:hover {
  background-color: var(--boton-hover);
}
</style>