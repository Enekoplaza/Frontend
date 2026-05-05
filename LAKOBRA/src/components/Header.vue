<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { ref } from 'vue'

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
      
      <!-- LÓGICA DEL LOGO ACTUALIZADA -->
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
            <RouterLink to="/principal" @click="cerrarMenu">
              {{ $t('header.inicio') }}
            </RouterLink>
          </li>

          <li v-if="!usuario">
            <a href="#" @click.prevent="$emit('abrirModal')" class="link-auth">
              {{ $t('header.login') }}
            </a>
          </li>

          <li class="user-welcome" v-else>
            <RouterLink to="/perfil">
              <strong>{{ usuario.nombre }}</strong>
              <span v-if="usuario.rol && usuario.rol.toLowerCase() !== 'admin'">
                ({{ usuario.rol }})
              </span>
            </RouterLink>
          </li>

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

          <li v-if="usuario && (usuario.rol === 'admin' || usuario.rol === 'txandalari')">
            <RouterLink to="/puerta">{{ $t('header.puerta') }}</RouterLink>
          </li>

          <li v-if="usuario">
            <a href="#" @click.prevent="$emit('logout')" class="btn-logout">
              {{ $t('header.logout') }}
            </a>
          </li>

          <li class="divider"></li>

          <li>
            <button class="btn-idioma" @click="toggleIdioma" :title="$t('header.cambiar_idioma')">
              {{ locale === 'es' ? 'EUS' : 'ES' }}
            </button>
          </li>

          <li>
            <button
              class="btn-tema theme-toggle"
              :class="{ 'is-dark': modoOscuro }"
              @click="$emit('toggleTema')"
              :title="$t('header.cambiar_tema')"
            >
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
  max-width: 1200px;
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
   📍 NAV
   ========================================= */

.lista {
  display: flex;
  gap: 1.2rem;
  list-style: none;
  align-items: center;
  flex-wrap: wrap;
}

a {
  color: var(--header-text);
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.25s ease;
  position: relative;
}

a:hover {
  color: var(--header-accent);
}

.router-link-active:not(.logo-link) {
  color: var(--header-accent);
  border-bottom: 2px solid var(--header-accent);
  border-radius: 0;
}

/* =========================================
   👤 USER & DIVIDER
   ========================================= */

.user-welcome {
  color: var(--header-text);
  font-size: 0.9rem;
  white-space: nowrap;
  opacity: 0.9;
}

.user-welcome strong {
  color: var(--header-accent);
}

.btn-logout {
  color: #ff4d4d !important;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.2s;
}

.btn-logout:hover {
  opacity: 0.8;
  border-bottom: none;
}

.divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.12);
}

/* =========================================
   🎨 BOTONES ACCIÓN
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
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: bold;
  transition: all 0.25s ease;
}

.btn-idioma:hover {
  color: var(--header-accent);
  border-color: var(--header-accent);
  background: rgba(56, 189, 248, 0.1);
}

/* =========================================
   🌗 ANIMACIÓN TEMA
   ========================================= */

.theme-toggle .sun-and-moon { transition: transform 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25); overflow: visible; }
.theme-toggle .sun-and-moon > :is(.moon, .sun, .sun-beams) { transform-origin: center; transition: transform 0.5s ease, opacity 0.5s ease; }
.theme-toggle .sun-and-moon .moon > circle { transition: transform 0.5s ease; }
.theme-toggle.is-dark .sun-and-moon { transform: rotate(-100deg); }
.theme-toggle.is-dark .sun-and-moon .sun { transform: scale(1.75); }
.theme-toggle.is-dark .sun-and-moon .sun-beams { opacity: 0; transform: rotate(-25deg) scale(0.5); }
.theme-toggle.is-dark .sun-and-moon .moon > circle { transform: translateX(-7px); }

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
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {
  .header-container { padding: 1rem 20px; }
  .lista { gap: 0.9rem; }
  .logo { font-size: 22px; }
}

/* =========================================
   📱 MÓVIL (EL MENÚ DEL COMPAÑERO ARREGLADO)
   ========================================= */
@media (max-width: 768px) {
  .header-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 15px;
  }

  .logo { font-size: 20px; }
  .logo-img { height: 30px; }

  /* 🍔 Forzar hamburguesa a la derecha */
  .hamburguesa {
    display: block;
    margin-left: auto;
  }

  /* 📦 El menú deslizante de tu compañero */
  .nav {
    position: absolute;
    top: 100%;
    right: 0;
    width: 100%;
    background: linear-gradient(135deg, var(--header-bg-start), var(--header-bg-end));
    box-shadow: 0 10px 20px rgba(0,0,0,0.5); /* Sombra añadida para que no quede plano sobre el body */
    
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

  /* ❗ Formato de lista original (derecha) */
  .lista {
    flex-direction: column;
    padding: 1.5rem 0;
    gap: 0; /* Quitamos gap para usar padding en el enlace y que el click sea más fácil */
  }

  .lista li {
    width: 100%;
    text-align: right;
  }

  .lista a, .btn-logout {
    display: block;
    width: 100%;
    padding: 12px 25px;
    text-align: right;
  }

  .user-welcome {
    text-align: right;
    padding: 10px 25px;
  }

  .divider {
    display: none;
  }

  /* Ajustes para los botones de idioma y tema en móvil */
  .btn-idioma, .btn-tema {
    margin: 5px 25px 5px auto;
  }
}
</style>