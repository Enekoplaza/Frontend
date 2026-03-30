<template>
  <div class="container principal">
    <h1>{{ textos.principal.titulo }}</h1>

    <div class="descripcion">
      <p v-for="(parrafo, index) in parrafos" :key="index">
        {{ parrafo }}
      </p>
    </div>

    <button class="btn-traducir" @click="cambiarIdioma">
      <svg v-if="idiomaActual.lang === 'es'" class="flag-icon" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="700" fill="#d90012"/>
        <path d="M0,0 L1000,700 M1000,0 L0,700" stroke="#009b48" stroke-width="130"/>
        <path d="M0,350 L1000,350 M500,0 L500,700" stroke="#ffffff" stroke-width="130"/>
      </svg>
      
      <svg v-else class="flag-icon" viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg">
        <rect width="750" height="500" fill="#c60b1e"/>
        <rect width="750" height="250" y="125" fill="#ffc400"/>
      </svg>

      <span>{{ textos.botonTraducir }}</span>
    </button>
  </div>
</template>

<script setup>
import { i18n, cargarIdioma } from '../i18n.js'
import { reactive, ref, computed, onMounted } from 'vue'

// Objeto reactivo para los textos
const textos = reactive({
  principal: {}
})

// Idioma actual
const idiomaActual = ref('eu') // Euskera por defecto

// Computed para separar los párrafos
const parrafos = computed(() => {
  if (!textos.principal.descripcion) return []
  return textos.principal.descripcion.split('\n\n')
})

// Cambiar idioma
async function cambiarIdioma() {
  const nuevo = idiomaActual.value === 'eu' ? 'es' : 'eu'
  await cargarIdioma(nuevo)                  // esperamos que i18n cargue
  idiomaActual.value = nuevo
  Object.assign(textos, i18n.textos.principal) // actualizamos los textos reactivos
}

// Cargar idioma por defecto al montar
onMounted(async () => {
  await cargarIdioma('eu')                   // cargamos JSON de inicio
  idiomaActual.value = 'eu'
  Object.assign(textos, i18n.textos.principal)
})
</script>
<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: 800;
  color: var(--titulo);
}

.descripcion p {
  margin-bottom: 1.5rem;
  text-align: justify;
  line-height: 1.8;
  font-size: 1.05rem;
}

/* Diseño del botón del idioma con la bandera */
.btn-traducir {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 2rem;
  padding: 0.5rem; /* Reducimos el padding al no tener fondo */
  font-size: 1rem;
  font-weight: bold;
  background-color: transparent; 
  color: var(--texto);           
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-traducir:hover {
  background-color: transparent; /* invisible */
  color: var(--boton-bg);        /* El texto en azul al pasar el ratón */
  transform: translateY(-2px);   /* Un pequeñísimo salto para dar feedback de que es clickeable */
}

/* Estilo para que la bandera quede perfecta */
.flag-icon {
  width: 24px;
  height: 16px;
  border-radius: 2px;
  object-fit: cover;
  box-shadow: 0 0 3px rgba(0,0,0,0.5);
}
</style>