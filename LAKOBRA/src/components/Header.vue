<script setup>
const props = defineProps({
  usuario: Object
});
defineEmits(['abrirModal', 'logout']);
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo-container">
        <h2 class="logo">Lakobra</h2>
      </div>

      <nav class="nav">
        <ul class="lista">
          <li v-if="!usuario">
            <a href="#" @click.prevent="$emit('abrirModal')" class="link-auth">Iniciar Sesión</a>
          </li>

          <template v-else>
            <li class="user-welcome">
              <span v-if="usuario.rol === 'admin'">Admin <strong>{{ usuario.nombre }}</strong></span>
              <span v-else-if="usuario.rol === 'txandalari'">Worker <strong>{{ usuario.nombre }}</strong></span>
              <span v-else>Hola, <strong>{{ usuario.nombre }}</strong></span>
            </li>
            <li><a href="#" @click.prevent="$emit('logout')" class="btn-logout">Salir</a></li>
          </template>

          <li>
            <RouterLink to="/socios/as">Socios/as</RouterLink>
          </li>
          <li>
            <RouterLink to="/artistas">Artistas</RouterLink>
          </li>
          <li>
            <RouterLink to="/eventos">Eventos</RouterLink>
          </li>
          <li>
            <RouterLink to="/contacto">Contacto</RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  --header-bg-start: #1e293b;
  --header-bg-end: #0f172a;
  --header-accent: #38bdf8;
  --header-text: #f8fafc;
  width: 100%;
  background: linear-gradient(135deg, var(--header-bg-start), var(--header-bg-end));
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  color: var(--header-accent);
}

.lista {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  align-items: center;
}

a {
  color: var(--header-text);
  text-decoration: none;
  font-weight: 600;
  transition: 0.3s;
}

a:hover {
  color: var(--header-accent);
}


.user-welcome {
  color: var(--header-text);
  font-size: 0.9rem;
}

.user-welcome strong {
  color: var(--header-accent);
}

.btn-logout {
  color: #ff4d4d !important;
  font-size: 0.8rem;
  cursor: pointer;
}

.router-link-active {
  border-bottom: 2px solid var(--header-accent);
}
</style>