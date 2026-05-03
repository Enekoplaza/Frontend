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
let observer = null;
let glowPlayed = false;

async function loadSvg() {
  const response = await fetch(guitarSvgUrl);
  svgContent.value = await response.text();

  await nextTick();

  const paths = svgWrapper.value.querySelectorAll('path');

  paths.forEach((path) => {
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
              glowAnimation.play();
              glowPlayed = true;
            });
          }
        } else {
          guitarAnimation.pause();
        }
      });
    },
    { threshold: 0.35 }
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

    const timeline = anime.timeline({
      easing: 'easeOutExpo',
    });

    timeline
      .add({
        targets: tituloRef.value,
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1200
      })
      .add({
        targets: logoRef.value,
        opacity: [0, 1],
        scale: [0.95, 1],
        easing: 'easeOutCubic',
        duration: 1000
      }, '-=600')
      .add({
        targets: descripcionRef.value.querySelectorAll('p'),
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(200),
        duration: 2000
      }, 1200);

    guitarAnimation = anime({
      targets: guitarPaths,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 25500,
      delay: (el, i) => i * 10,
      autoplay: false
    });

    glowAnimation = anime({
      targets: guitarPaths,
      stroke: [
        { value: "#38bdf8" },
        { value: "#ffffff" },
        { value: "#38bdf8" }
      ],
      strokeWidth: [
        { value: 6 },
        { value: 9 },
        { value: 6 }
      ],
      easing: "easeInOutSine",
      duration: 1800,
      autoplay: false,
      loop: 2,
      direction: "alternate"
    });

    setupScrollAnimation();

    anime({
      targets: tituloRef.value,
      scale: [1, 1.02],
      textShadow: [
        '0 0 25px rgba(56, 189, 248, 0.15)',
        '0 0 45px rgba(56, 189, 248, 0.6)'
      ],
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      duration: 2500
    });

  } catch (error) {
    console.error('Error en la animación:', error);
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  if (guitarAnimation) guitarAnimation.pause();
  if (glowAnimation) glowAnimation.pause();
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
  text-shadow: 0 0 25px rgba(56, 189, 248, 0.15);
  will-change: transform, text-shadow, opacity;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1rem auto 3rem auto;
  opacity: 0;
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
  stroke-width: 10;
  fill: transparent;
  filter: drop-shadow(0px 0px 8px rgba(56, 189, 248, 0.4)) drop-shadow(0px 0px 18px rgba(255, 255, 255, 0.25));
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
  .titulo {
    font-size: 2.2rem;
  }

  .lakobra-img {
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .titulo {
    font-size: 1.9rem;
  }

  .lakobra-img {
    max-width: 250px;
  }
}
</style>