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
  padding: 2.5rem 1.2rem;
}

/* =========================================
   🔥 TÍTULO (más branding)
   ========================================= */

.titulo {
  text-align: center;
  font-size: 3.2rem;
  font-weight: 900;
  margin-bottom: 2.2rem;

  letter-spacing: 1px;
  text-transform: uppercase;

  color: var(--titulo);

  /* efecto más moderno */
  background: linear-gradient(90deg, #38bdf8, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow: 0 0 25px rgba(56, 189, 248, 0.15);
}

/* =========================================
   📖 DESCRIPCIÓN
   ========================================= */

.descripcion {
  text-align: justify;
  display: flex;
  flex-direction: column;
  gap: 1.4rem; /* separación uniforme */
}

.descripcion p {
  margin: 0; /* quitamos márgenes raros */
  line-height: 1.8;
  font-size: 1.15rem;
  color: var(--texto);
}

/* QUITAMOS cualquier diferencia */
.descripcion p:first-child {
  all: unset;
  line-height: 1.8;
  font-size: 1.15rem;
  color: var(--texto);
}

/* Mantener coherencia en strong */
.descripcion strong {
  font-weight: 700;
  color: var(--texto);
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
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */

@media (max-width: 768px) {
  .container {
    padding: 2rem 1rem;
  }

  .titulo {
    font-size: 2.2rem;
    margin-bottom: 1.8rem;
  }

  .descripcion {
    gap: 1rem;
  }

  .descripcion p {
    font-size: 1.05rem;
    line-height: 1.75;
  }

  .descripcion p:first-child {
    font-size: 1.1rem;
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
  }
}
</style>