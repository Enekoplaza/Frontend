<template>
  <div class="container">
    <h1>{{ textos.titulo }}</h1>

    <div class="descripcion">
      <p v-for="(parrafo, index) in parrafos" :key="index">
        {{ parrafo }}
      </p>
    </div>

    <button class="btn-traducir" @click="cambiarIdioma">
      {{ textos.botonTraducir }}
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

function cambiarIdioma() {
  if (textos.descripcion === textosEspañol.descripcion) {
    Object.assign(textos, textosEuskera)
  } else {
    Object.assign(textos, textosEspañol)
  }
}
</script>

<style scoped>

:root {
  --color-fondo: #ffffff;
  --color-texto: #333333;
  --color-titulo: #222222;
  --color-boton-bg: #007BFF;
  --color-boton-texto: #ffffff;
  --color-boton-hover: #0056b3;


  --fuente-principal: 'Arial', sans-serif;
  --line-height: 1.6;
  --gap-parrafo: 1.2rem;
  --padding-container: 2rem;
  --border-radius: 8px;
}


.container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--padding-container);
  text-align: center;
  font-family: var(--fuente-principal);
  line-height: var(--line-height);
  color: var(--color-texto);
  background-color: var(--color-fondo);
  transition: background-color 0.3s, color 0.3s;
}


h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: bold;
  color: var(--color-titulo);
}


.descripcion p {
  margin-bottom: var(--gap-parrafo);
  text-align: justify;
}


.btn-traducir {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background-color: var(--color-boton-bg);
  color: var(--color-boton-texto);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.btn-traducir:hover {
  background-color: var(--color-boton-hover);
  transform: scale(1.05);
}
</style>