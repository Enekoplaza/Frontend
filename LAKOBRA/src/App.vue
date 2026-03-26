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
      <p>INFO LAKOBRA.</p>
    </main>

    <Footer />
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