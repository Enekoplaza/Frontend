<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = defineProps({
  usuario: Object,
  modoOscuro: Boolean,
})

defineEmits(['abrirModal', 'logout', 'toggleTema'])

const { locale } = useI18n()

// 🔄 Cambiar idioma
const toggleIdioma = () => {
  locale.value = locale.value === 'es' ? 'eus' : 'es'
}

// 🔐 Detectar admin (robusto)
const esAdmin = computed(() => {
  return props.usuario?.rol?.toLowerCase() === 'admin'
})
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo-container">
        <h2 class="logo">Lakobra</h2>
      </div>

      <nav class="nav">
        <ul class="lista">
          <!-- INICIO -->
          <li>
            <RouterLink to="/principal">
              {{ $t('header.inicio') }}
            </RouterLink>
          </li>

          <!-- LOGIN / USUARIO -->
          <li v-if="!usuario">
            <a href="#" @click.prevent="$emit('abrirModal')" class="link-auth">
              {{ $t('header.login') }}
            </a>
          </li>

          <!-- USUARIO LOGUEADO -->
          <li class="user-welcome" v-else>
            <RouterLink to="/perfil">
              <strong>{{ usuario.nombre }}</strong>
              <span v-if="usuario.rol && usuario.rol.toLowerCase() !== 'admin'">
                ({{ usuario.rol }})
              </span>
            </RouterLink>
          </li>

          <!-- ENLACES -->
          <li v-if="!esAdmin">
            <RouterLink to="/artistas">
              {{ $t('header.artistas') }}
            </RouterLink>
          </li>

          <li v-if="esAdmin">
            <RouterLink to="/solicitudes">
              {{ $t('header.solicitudes') }}
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/eventos">
              {{ $t('header.eventos') }}
            </RouterLink>
          </li>

          <!-- LOGOUT -->
          <li v-if="usuario">
            <a href="#" @click.prevent="$emit('logout')" class="btn-logout">
              {{ $t('header.logout') }}
            </a>
          </li>

          <!-- SEPARADOR -->
          <li class="divider"></li>

          <!-- BOTÓN IDIOMA -->
          <li>
            <button class="btn-idioma" @click="toggleIdioma" :title="$t('header.cambiar_idioma')">
              {{ locale === 'es' ? 'EUS' : 'ES' }}
            </button>
          </li>

          <!-- BOTÓN TEMA -->
          <li>
            <button
              class="btn-tema"
              @click="$emit('toggleTema')"
              :title="$t('header.cambiar_tema')"
            >
              <svg
                v-if="modoOscuro"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
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

.divider {
  width: 1px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 0.5rem;
}

.btn-tema {
  background: none;
  border: none;
  color: var(--header-text);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-tema:hover {
  color: var(--header-accent);
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(15deg);
}

.btn-idioma {
  background: none;
  border: 1px solid var(--header-text);
  color: var(--header-text);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  transition: 0.3s;
}

.btn-idioma:hover {
  color: var(--header-accent);
  border-color: var(--header-accent);
}
</style>