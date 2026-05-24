import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { createI18n } from 'vue-i18n' // <-- Importamos i18n
// Importamos los diccionarios
import es from './locales/es.json'
import eus from './locales/eus.json'

// Configuramos los idiomas
const i18n = createI18n({
  legacy: false, // <-- IMPORTANTE: Le dice a i18n que use Composition API
  locale: 'eus', // Idioma por defecto al entrar
  fallbackLocale: 'es', 
  messages: { es, eus }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n) // <-- Usamos i18n en la app
app.mount('#app')