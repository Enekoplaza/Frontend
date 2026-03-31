<template>
  <div class="container">
    <h1 class="titulo">LAKOBRA</h1>

    <div class="descripcion">
      <p>
        <strong>Lakobra</strong> gazte eta kultural autogestionatutako elkartea da,
        Deustuko auzoan (Bilbo) kokatua. Espazio komunitario alternatibo gisa
        funtzionatzen du, non jarduera sozial, kultural eta politikoak antolatzen
        diren ikuspegi parte-hartzaile eta asanbleario batetik.
      </p>

      <p>
        Lakobrak kontzertuak, tailerrak, hitzaldiak eta bestelako ekitaldi
        kulturalak antolatzen ditu, gazte eta auzoko kolektiboentzako topagune bat
        eskainiz. Gainera, kultura alternatiboa eta pentsamendu kritikoa sustatzen
        ditu, baita ekimen sozialak eta auzoko mugimenduak babestu ere.
      </p>

      <p>
        Elkarteak aisialdi alternatibo, ez komertzial eta parte-hartzailea
        proposatzen du, espazio inklusibo eta ireki baten bidez. Helburua da
        solidariotasuna, elkartasuna eta kultura kritikoa sustatzea, eta aldi berean
        Deustuko auzoaren bizitza kulturalaren dinamizazioa bultzatzea.
      </p>

      <p>
        Lakobra batez ere Deustuko eta Bilboko gazteei zuzenduta dago, baina baita
        kolektibo sozial eta kulturalentzat, kultura alternatiboan interesa duten
        pertsonentzat eta auzoko bizilagunentzat ere. Parte hartu nahi duen edonork
        du tokia bertan.
      </p>
    </div>
  </div>
</template>

<script setup>
// Sin lógica de momento
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* TÍTULO */
.titulo {
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: var(--titulo);
}

/* TEXTO */
.descripcion {
  text-align: justify;
}

.descripcion p {
  margin-bottom: 1.5rem;
  line-height: 1.9;
  font-size: 1.2rem;
  color: var(--texto);
}

/* PRIMER PÁRRAFO DESTACADO */
.descripcion p:first-child {
  font-size: 1.2rem;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .titulo {
    font-size: 2.2rem;
  }

 
}
</style>