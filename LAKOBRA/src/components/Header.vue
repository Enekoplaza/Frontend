<script setup>
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

const menuAbierto = ref(false)

const toggleMenu = () => {
  menuAbierto.value = !menuAbierto.value
}

const cerrarMenu = () => {
  menuAbierto.value = false
}

const props = defineProps({
  usuario: Object,
  modoOscuro: Boolean,
})

defineEmits(['abrirModal', 'logout', 'toggleTema'])

const { locale } = useI18n()

const toggleIdioma = () => {
  locale.value = locale.value === 'es' ? 'eus' : 'es'
}

const esAdmin = computed(() => {
  return props.usuario?.rol?.toLowerCase() === 'admin'
})
</script>

<template>
  <header class="header">
    <div class="header-container">

      <div class="logo-container">
        <router-link to="/principal" class="logo-link">
          <img src="../assets/logolakobra.png" alt="Logo Lakobra" class="logo-img" />
          <h2 class="logo">Lakobra</h2>
        </router-link>
      </div>

      <button class="hamburguesa" @click="toggleMenu">
        ☰
      </button>

      <nav class="nav" :class="{ abierto: menuAbierto }">
        <ul class="lista">
          <li>
            <RouterLink to="/principal" @click="cerrarMenu" class="nav-item">
              <span class="icono-nav">🏠</span> {{ $t('header.inicio') }}
            </RouterLink>
          </li>

          <li v-if="!usuario">
            <a href="#" @click.prevent="$emit('abrirModal'); cerrarMenu()" class="link-auth nav-item">
              <span class="icono-nav">🔑</span> {{ $t('header.login') }}
            </a>
          </li>

          <li class="user-welcome" v-else>
            <RouterLink to="/perfil" class="nav-item perfil-link" @click="cerrarMenu">
              <span class="icono-nav">👤</span>
              <strong>{{ usuario.nombre }}</strong>
              <span v-if="usuario.rol && usuario.rol.toLowerCase() !== 'admin'" class="rol-badge">
                ({{ usuario.rol }})
              </span>
            </RouterLink>
          </li>

          <li v-if="!esAdmin">
            <RouterLink to="/artistas" class="nav-item" @click="cerrarMenu">
              <span class="icono-nav">🎸</span> {{ $t('header.artistas') }}
            </RouterLink>
          </li>

          <li v-if="esAdmin">
            <RouterLink to="/solicitudes" class="nav-item" @click="cerrarMenu">
              <span class="icono-nav">✉️</span> {{ $t('header.solicitudes') }}
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/eventos" class="nav-item" @click="cerrarMenu">
              <span class="icono-nav">📅</span> {{ $t('header.eventos') }}
            </RouterLink>
          </li>

          <li v-if="usuario && (usuario.rol === 'admin' || usuario.rol === 'txandalari')">
            <RouterLink to="/puerta" class="nav-item" @click="cerrarMenu">
              <span class="icono-nav">🚪</span> {{ $t('header.puerta') }}
            </RouterLink>
          </li>

          <li v-if="usuario">
            <a href="#" @click.prevent="$emit('logout'); cerrarMenu()" class="btn-logout nav-item">
              <svg class="icono-salir" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {{ $t('header.logout') }}
            </a>
          </li>

          <li class="divider"></li>

          <li>
            <button class="btn-idioma nav-item" @click="toggleIdioma(); cerrarMenu()" :title="$t('header.cambiar_idioma')">
              <span class="icono-nav">🌍</span> {{ locale === 'es' ? 'EUS' : 'ES' }}
            </button>
          </li>

          <li>
            <button class="btn-tema theme-toggle nav-item" :class="{ 'is-dark': modoOscuro }"
              @click="$emit('toggleTema'); cerrarMenu()" :title="$t('header.cambiar_tema')">
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
/* =========================================
   🌌 HEADER BASE (MODERNO)
   ========================================= */
.header {
  --header-bg-start: #1e293b;
  --header-bg-end: #0f172a;
  --header-accent: #38bdf8;
  --header-text: #f8fafc;

  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;

  background: linear-gradient(135deg, var(--header-bg-start), var(--header-bg-end));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* =========================================
   🧱 CONTAINER
   ========================================= */
.header-container {
  max-width: 1450px;
  margin: 0 auto;
  padding: 1rem 25px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* =========================================
   🔥 LOGO Y TEXTO (CON IMAGEN)
   ========================================= */
.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  border: none;
  padding: 0;
}

.logo-link.router-link-active {
  border-bottom: none;
}

.logo-img {
  height: 50px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(182, 17, 17, 0.925));
  transition: transform 0.3s ease;
}

.logo-link:hover .logo-img {
  transform: scale(1.05) rotate(-3deg);
}

.logo {
  font-size: 24px;
  font-weight: 900;
  color: var(--header-accent);
  letter-spacing: 0.5px;
  white-space: nowrap;
  margin: 0;
  text-shadow: 0 0 18px rgba(56, 189, 248, 0.15);
}

/* =========================================
   📍 NAV & ENLACES (CON ICONOS)
   ========================================= */
.lista {
  display: flex;
  gap: 1.2rem;
  list-style: none;
  align-items: center;
  flex-wrap: nowrap;
  margin: 0;
  padding: 0;
}

/* Base para los enlaces con iconos */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--header-text);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: var(--header-accent);
  transform: translateY(-2px);
}

.router-link-active:not(.logo-link) {
  color: var(--header-accent);
  border-bottom: 2px solid var(--header-accent);
  border-radius: 0;
}

.icono-nav {
  font-size: 1.15rem;
}

/* =========================================
   👤 USER, LOGOUT & DIVIDER
   ========================================= */
.user-welcome {
  white-space: nowrap;
  opacity: 0.9;
}

.perfil-link {
  color: #38bdf8 !important;
}

.rol-badge {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-left: 2px;
}

.btn-logout {
  color: #ef4444 !important;
}

.icono-salir {
  color: #ef4444;
  transition: transform 0.3s ease;
}

.btn-logout:hover .icono-salir {
  transform: translateX(4px);
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.5rem;
}

/* =========================================
   🎨 BOTONES ACCIÓN (TEMA E IDIOMA)
   ========================================= */
.btn-tema {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--header-text);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.btn-tema:hover {
  color: var(--header-accent);
  background: rgba(56, 189, 248, 0.12);
  transform: scale(1.05);
}

.btn-idioma {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--header-text);
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.25s ease;
}

.btn-idioma:hover {
  color: var(--header-accent);
  border-color: var(--header-accent);
  background: rgba(56, 189, 248, 0.1);
  transform: translateY(-2px);
}

/* =========================================
   🌗 ANIMACIÓN TEMA
   ========================================= */
.theme-toggle .sun-and-moon {
  transition: transform 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25);
  overflow: visible;
}
.theme-toggle .sun-and-moon > :is(.moon, .sun, .sun-beams) {
  transform-origin: center;
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.theme-toggle .sun-and-moon .moon > circle {
  transition: transform 0.5s ease;
}
.theme-toggle.is-dark .sun-and-moon {
  transform: rotate(-100deg);
}
.theme-toggle.is-dark .sun-and-moon .sun {
  transform: scale(1.75);
}
.theme-toggle.is-dark .sun-and-moon .sun-beams {
  opacity: 0;
  transform: rotate(-25deg) scale(0.5);
}
.theme-toggle.is-dark .sun-and-moon .moon > circle {
  transform: translateX(-7px);
}

/* =========================================
   🍔 HAMBURGUESA
   ========================================= */
.hamburguesa {
  display: none;
  font-size: 26px;
  background: none;
  border: none;
  color: var(--header-text);
  cursor: pointer;
}

/* =========================================
   📱 RESPONSIVE (TABLET & MÓVIL)
   ========================================= */
@media (max-width: 1024px) {
.header-container { 
    padding: 1rem 15px; 
    gap: 0.5rem; 
  }
  .lista { gap: 0.4rem; } /* Juntamos los botones un poco más */
  .nav-item { 
    padding: 6px 6px; 
    font-size: 0.9rem; /* Letra un pelín más pequeña para que quepa todo */
  }
  .icono-nav { font-size: 1rem; }
  .logo { font-size: 20px; }
  .logo-img { height: 40px; }
}


@media (max-width: 768px) {
  .header-container {
    padding: 0.8rem 15px;
  }
  .logo { font-size: 20px; }
  .logo-img { height: 30px; }

  .hamburguesa {
    display: block;
    margin-left: auto;
  }

  .nav {
    position: absolute;
    top: 100%;
    right: 0;
    width: 100%;
    background: linear-gradient(135deg, var(--header-bg-start), var(--header-bg-end));
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
  }

  .nav.abierto {
    transform: translateX(0);
    opacity: 1;
    pointer-events: auto;
  }

  .lista {
    flex-direction: column;
    padding: 1.5rem 0;
    gap: 0;
  }

  .lista li { width: 100%; }

  /* En móvil, los flex items necesitan justify-content para ir a la derecha */
  .nav-item {
    justify-content: flex-end;
    width: 100%;
    padding: 12px 25px;
  }

  .nav-item:hover {
    transform: translateX(-5px); /* Efecto de desplazamiento a la izquierda al hacer click en móvil */
  }

  .divider { display: none; }

  .btn-idioma {
    margin: 5px 25px 5px auto; /* Mantenemos el idioma como estaba */
  }

  .btn-tema {
    width: 40px;
    height: 40px;
    margin: 5px auto; /* 👈 Este cambio centra el botón horizontalmente en el menú móvil */
    padding: 0;
    display: flex; /* Asegura que el SVG siga centrado dentro del botón */
    align-items: center;
    justify-content: center;
  }
}
</style>