<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app-container">
    <div>
      <Header />
      <router-view />
    </div>
    <main class="content">
      <h1>Bienvenido a Lakobra</h1>
      <p>iNFO LAKOBRA.</p>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Ocupa el 100% de la altura de la ventana /
  width: 100%; / Ocupa todo el ancho /
}

.content {
  flex: 1; / Esto hace que el main crezca y empuje al footer al final */
  padding: 40px 20px;
}
</style>
