<script setup>
import { useI18n } from 'vue-i18n' // Importamos la herramienta de idioma

const props = defineProps({
  usuario: Object,
  modoOscuro: Boolean,
})
defineEmits(['abrirModal', 'logout', 'toggleTema'])

const { locale } = useI18n() // Obtenemos el idioma actual

// Función para alternar el idioma
const toggleIdioma = () => {
  locale.value = locale.value === 'es' ? 'eus' : 'es'
}
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
            <a href="#" @click.prevent="$emit('abrirModal')" class="link-auth">{{ $t('header.login') }}</a>
          </li>

          <li class="user-welcome" v-else>
            <RouterLink to="/perfil">
              <strong>{{ usuario.nombre }}</strong>
            </RouterLink>
          </li>

          <li><RouterLink to="/artistas">{{ $t('header.artistas') }}</RouterLink></li>
          <li><RouterLink to="/eventos">{{ $t('header.eventos') }}</RouterLink></li>
          <li><RouterLink to="/contacto">{{ $t('header.contacto') }}</RouterLink></li>
          <li><RouterLink to="/principal">{{ $t('header.inicio') }}</RouterLink></li>

          <li v-if="usuario">
            <a href="#" @click.prevent="$emit('logout')" class="btn-logout">{{ $t('header.logout') }}</a>
          </li>

          <li class="divider"></li>

          <li>
            <button class="btn-idioma" @click="toggleIdioma" title="Cambiar idioma">
              {{ locale === 'es' ? 'EUS' : 'ES' }}
            </button>
          </li>

          <li>
            <button class="btn-tema theme-toggle" :class="{ 'is-dark': modoOscuro }" @click="$emit('toggleTema')"
              :title="modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
              <svg class="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
                <mask class="moon" id="moon-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <circle cx="24" cy="10" r="6" fill="black" />
                </mask>
                <circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
                <g class="sun-beams" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </g>
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