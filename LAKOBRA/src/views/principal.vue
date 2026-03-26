<template>
  <div class="container">
    <h1>{{ textos.titulo }}</h1>

    <div class="descripcion">
      <p v-for="(parrafo, index) in parrafos" :key="index">
        {{ parrafo }}
      </p>
    </div>

    <button class="btn-traducir" @click="cambiarIdioma">
      <svg v-if="idiomaActual === 'es'" class="flag-icon" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
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
import { reactive, computed } from 'vue'

const textosEspañol = {
  titulo: 'LAKOBRA',
    descripcion: `¿Qué es la asociación? La Kobra es una asociación juvenil y cultural autogestionada situada en
el barrio de Deusto (Bilbao). Funciona como un espacio comunitario alternativo donde se
organizan actividades sociales, culturales y políticas desde una perspectiva participativa y
asamblearia.

¿Qué hace? La Kobra: Organiza conciertos, talleres, charlas y eventos culturales.
Ofrece un espacio de encuentro para jóvenes y colectivos del barrio. Promueve actividades
relacionadas con la cultura alternativa y el pensamiento crítico. Apoya iniciativas sociales y
movimientos vecinales. Fomenta la autogestión y la participación comunitaria. Es un punto de
referencia para la organización de actividades fuera de los circuitos comerciales
tradicionales.

¿Qué propone? La asociación propone: Un modelo de ocio alternativo, no
comercial y participativo. Un espacio inclusivo donde cualquier persona pueda implicarse. La
promoción de valores como la solidaridad, el apoyo mutuo y la cultura crítica. Dinamizar la
vida cultural del barrio de Deusto. En resumen, propone una forma diferente de organizar
actividades culturales y sociales, basada en la autogestión y la comunidad.

¿A quién se dirige? Principalmente se dirige a: Jóvenes del barrio de Deusto y de Bilbao. Colectivos
sociales y culturales. Personas interesadas en la cultura alternativa y los movimientos
sociales. Vecinos y vecinas que quieran participar en actividades comunitarias. Aunque su
público principal es juvenil, está abierta a cualquier persona interesada.`,
  botonTraducir: 'Euskera',
}

const textosEuskera = {
  titulo: 'LAKOBRA',
  descripcion: `Zer da elkartea? Lakobra gazte eta kultural autogestionatutako elkartea da, Deustuko auzoan (Bilbo) kokatua.
Espazio komunitario alternatibo gisa funtzionatzen du, non jarduera sozial, kultural eta politikoak
antolatzen diren parte-hartze eta asanbleario ikuspegitik.

Zer egiten du? Lakobrak: Kontzertuak, tailerrak, hitzaldiak eta ekitaldi kulturalak antolatzen ditu.
Gazte eta auzoko kolektiboentzako topagune bat eskaintzen du. Kultur alternatiboarekin eta pentsamendu kritikoarekin lotutako jarduerak sustatzen ditu.
Ekimen sozialen eta auzoko mugimenduen alde egiten du. Autogestioa eta komunitatearen parte-hartzea bultzatzen ditu.
Ekitaldiak merkatu komertzialetik kanpo antolatzeko erreferentea da.

Zer proposatzen du? Elkarteak proposatzen du: aisialdi alternatibo, ez komertzial eta parte-hartzaile bat.
Espazio inklusibo bat, edonork inplikatu daitekeena. Solidariotasun, elkartasun eta kultura kritikoaren balioak sustatzea.
Deustuko auzoaren bizitza kultural dinamizatzea. Laburbilduz, jarduera kultural eta sozialak modu desberdinean antolatzea proposatzen du, autogestioan eta komunitatean oinarrituta.

Norentzat da? Nagusiki: Deustuko eta Bilboko gazteentzat. Kolektibo sozial eta kulturalentzat.
Kultura alternatiboan eta mugimendu sozialetan interesa duten pertsonentzat. Auzoko bizilagunentzat. Gazteentzako ariketa nagusia izanik, interesa duen edonork parte hartu dezake.`,
  botonTraducir: 'Castellano',
}

const textos = reactive({ ...textosEspañol })

const parrafos = computed(() => textos.descripcion.split('\n\n'))

// Computed para saber fácilmente en qué idioma estamos y poner la bandera correcta
const idiomaActual = computed(() => 
  textos.descripcion === textosEspañol.descripcion ? 'es' : 'eu'
)

function cambiarIdioma() {
  if (idiomaActual.value === 'es') {
    Object.assign(textos, textosEuskera)
  } else {
    Object.assign(textos, textosEspañol)
  }
}
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