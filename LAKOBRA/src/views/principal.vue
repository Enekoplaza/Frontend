<template>
  <div class="container">
    <h1 class="titulo">LAKOBRA</h1>

    <div class="descripcion">
      <p><strong>Lakobra</strong> {{ $t('principal.p1') }}</p>
      <p>{{ $t('principal.p2') }}</p>
      <p>{{ $t('principal.p3') }}</p>
      <p>{{ $t('principal.p4') }}</p>
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
  line-height: 1.1;
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

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {

  .titulo {
    font-size: 2.6rem;
  }

  .descripcion p {
    font-size: 1.1rem;
    line-height: 1.8;
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */
@media (max-width: 768px) {

  .container {
    padding: 1.5rem 1rem;
  }

  .titulo {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
  }

  .descripcion p {
    font-size: 1.05rem;
    line-height: 1.75;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {

  .titulo {
    font-size: 1.9rem;
  }

  .descripcion p {
    font-size: 1rem;
    line-height: 1.7;
  }
}
</style>