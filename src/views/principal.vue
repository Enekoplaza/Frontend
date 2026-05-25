<template>
  <div class="container">
    <h1 class="titulo" ref="tituloRef">LAKOBRA</h1>

    <div class="logo-container" ref="logoRef">
      <img src="../assets/lakobra.jpg" alt="Lakobra Logo" class="lakobra-img" />
    </div>

    <div class="descripcion" ref="descripcionRef">
      <p><strong>Lakobra</strong> {{ $t('principal.p1') }}</p>
      <p>{{ $t('principal.p2') }}</p>

      <!-- Guitarra externa -->
      <div class="guitar-container" ref="guitarRef">
        <div class="guitar-svg" ref="svgWrapper" v-html="svgContent"></div>
      </div>

      <p>{{ $t('principal.p3') }}</p>
      <p>{{ $t('principal.p4') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import guitarSvgUrl from '@/assets/guitar.svg?url';

const anime = window.anime;

const tituloRef = ref(null);
const descripcionRef = ref(null);
const guitarRef = ref(null);
const logoRef = ref(null);
const svgWrapper = ref(null);

const svgContent = ref('');

let guitarAnimation = null;
let glowAnimation = null;
let tituloAnimation = null;
let observer = null;
let glowPlayed = false;

async function loadSvg() {
  const response = await fetch(guitarSvgUrl);
  svgContent.value = await response.text();

  await nextTick();

  const paths = svgWrapper.value.querySelectorAll('path');

  // Pre-calculamos y aplicamos estilos directamente para no bloquear la animación
  paths.forEach((path) => {
    // Si el path es muy complejo, forzamos renderizado en GPU
    path.style.willChange = 'stroke-dashoffset'; 
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.style.fill = 'transparent';
  });

  return paths;
}

function setupScrollAnimation() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!guitarAnimation) return;

        if (entry.isIntersecting) {
          guitarAnimation.play();

          if (!glowPlayed) {
            guitarAnimation.finished.then(() => {
              // Verificamos si aún estamos en la pantalla antes de lanzar el glow
              if(glowAnimation) {
                 glowAnimation.play();
                 glowPlayed = true;
              }
            });
          }
        } else {
          // Pausar animaciones pesadas cuando no se ven
          guitarAnimation.pause();
          if (glowAnimation && glowPlayed) glowAnimation.pause();
        }
      });
    },
    // Reducimos el umbral para que empiece un poco antes y no haya tirones al verlo de golpe
    { threshold: 0.15 } 
  );

  observer.observe(guitarRef.value);
}

onMounted(async () => {
  try {
    if (!anime) {
      console.error("Anime.js no se ha cargado.");
      return;
    }

    const guitarPaths = await loadSvg();

    // 1. ANIMACIÓN DE ENTRADA LIGERA
    const timeline = anime.timeline({
      easing: 'easeOutQuart', // Cambiado a un easing menos costoso matemáticamente
    });

    timeline
      .add({
        targets: tituloRef.value,
        translateY: [-20, 0], // Reducido el movimiento
        opacity: [0, 1],
        duration: 800 // Reducido el tiempo
      })
      .add({
        targets: logoRef.value,
        opacity: [0, 1],
        scale: [0.97, 1],
        duration: 800
      }, '-=400')
      .add({
        targets: descripcionRef.value.querySelectorAll('p'),
        translateY: [15, 0],
        opacity: [0, 1],
        delay: anime.stagger(150), // Menos delay entre párrafos
        duration: 800
      }, '-=200');

    // 2. OPTIMIZACIÓN ANIMACIÓN GUITARRA
    guitarAnimation = anime({
      targets: guitarPaths,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'linear', // Linear es mucho más rápido para la GPU que easeInOutSine
      duration: 15000, // ¡ESTO ERA EL PROBLEMA MAYOR! 25500 era excesivo. 4s es un buen tiempo para una animación de trazo.
      delay: (el, i) => i * 15,
      autoplay: false // Lo controla el Scroll
    });

    // 3. OPTIMIZACIÓN GLOW
    glowAnimation = anime({
      targets: guitarPaths,
      stroke: [
        { value: "#38bdf8" },
        { value: "#ffffff" },
        { value: "#38bdf8" }
      ],
      // Eliminamos el cambio de strokeWidth, que fuerza al navegador a recalcular el layout
      easing: "linear",
      duration: 1500,
      autoplay: false,
      loop: 2,
      direction: "alternate"
    });

    setupScrollAnimation();

    // 4. ANIMACIÓN TÍTULO LIGERA
    tituloAnimation = anime({
      targets: tituloRef.value,
      scale: [1, 1.01], // Reducido
      textShadow: [
        '0 0 15px rgba(56, 189, 248, 0.2)',
        '0 0 30px rgba(56, 189, 248, 0.5)'
      ],
      direction: 'alternate',
      loop: true,
      easing: 'linear',
      duration: 3000
    });

  } catch (error) {
    console.error('Error en la animación:', error);
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  // Limpiamos TODAS las instancias de anime para liberar memoria
  if (guitarAnimation) anime.remove(guitarAnimation.animatables.map(a => a.target));
  if (glowAnimation) anime.remove(glowAnimation.animatables.map(a => a.target));
  if (tituloAnimation) anime.remove(tituloRef.value);
});
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2.5rem 1.2rem;
}

.titulo {
  text-align: center;
  font-size: 3.2rem;
  font-weight: 900;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--titulo);
  background: linear-gradient(90deg, #38bdf8, #0ea5e9);
  background-clip: text;
  -webkit-text-fill-color: transparent;
  /* El will-change ayuda al navegador a prepararse para animar sin tirones */
  will-change: transform, text-shadow, opacity;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1rem auto 3rem auto;
  opacity: 0;
  will-change: opacity, transform;
}

.lakobra-img {
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  object-fit: cover;
}

.guitar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 2rem auto 3rem auto;
}

.guitar-svg :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}

.guitar-svg :deep(path) {
  stroke: #0ea5e9;
  stroke-width: 8; /* Reducido un pelín para trazos más limpios */
  fill: transparent;
  /* Hemos quitado el drop-shadow complejo del SVG y lo dejamos simple,
     los drop-shadow en SVGs animados matan el rendimiento en móviles */
}

.descripcion {
  text-align: justify;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.descripcion p {
  margin: 0;
  line-height: 1.8;
  font-size: 1.15rem;
  color: var(--texto);
  will-change: transform, opacity;
}

@media (max-width: 768px) {
  .titulo { font-size: 2.2rem; }
  .lakobra-img { max-width: 300px; }
}

@media (max-width: 480px) {
  .titulo { font-size: 1.9rem; }
  .lakobra-img { max-width: 250px; }
}
</style>