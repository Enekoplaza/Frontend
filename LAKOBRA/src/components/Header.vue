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

/* =========================================
   ANIMACIÓN DEL TEMA (SUN & MOON MORPH)
   ========================================= */

/* Eliminamos la rotación antigua que tenías en :hover para que no estropee la nueva */
.btn-tema:hover {
  color: var(--header-accent);
  background: rgba(255, 255, 255, 0.1);
  /* Hemos quitado el transform: rotate(15deg); de aquí */
}

/* Configuramos el contenedor del SVG */
.theme-toggle .sun-and-moon {
  transition: transform 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25);
  overflow: visible;
}

/* Transiciones para todas las partes del icono */
.theme-toggle .sun-and-moon > :is(.moon, .sun, .sun-beams) {
  transform-origin: center center;
  transition: transform 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25), 
              opacity 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25);
}

.theme-toggle .sun-and-moon .moon > circle {
  transition: transform 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25);
}

/* =========================================
   ESTADO: MODO OSCURO (LUNA)
   ========================================= */

/* 1. Giramos todo el icono un poco hacia la izquierda */
.theme-toggle.is-dark .sun-and-moon {
  transform: rotate(-100deg);
}

/* 2. El círculo central se hace más grande */
.theme-toggle.is-dark .sun-and-moon .sun {
  transform: scale(1.75);
}

/* 3. Los rayos del sol se encogen, giran y desaparecen */
.theme-toggle.is-dark .sun-and-moon .sun-beams {
  opacity: 0;
  transform: rotate(-25deg) scale(0.5);
}

/* 4. El círculo de la máscara se mueve hacia la izquierda para "comerse" el sol */
.theme-toggle.is-dark .sun-and-moon .moon > circle {
  transform: translateX(-7px);
}
</style>