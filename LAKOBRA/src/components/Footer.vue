<script setup>
defineProps({
  usuario: Object,
})

defineEmits(['abrirModal'])
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="col">
        <router-link to="/principal">
          <h2 class="logo">Lakobra</h2>
        </router-link>
        <p class="description">{{ $t('footer.desc') }}</p>
      </div>

      <nav class="col">
        <h3>{{ $t('footer.enlaces') }}</h3>
        <ul class="footer-links">
          <li>
            <router-link to="/principal">{{ $t('header.inicio') }}</router-link>
          </li>
          <li v-if="!usuario">
            <button class="btn-login" @click="$emit('abrirModal')">{{ $t('header.login') }}</button>
          </li>
          <li>
            <router-link to="/artistas">{{ $t('header.artistas') }}</router-link>
          </li>
          <li>
            <router-link to="/eventos">{{ $t('header.eventos') }}</router-link>
          </li>
          <li>
            <router-link to="/contacto">{{ $t('header.contacto') }}</router-link>
          </li>
        </ul>
      </nav>

      <div class="col">
        <h3>{{ $t('kontaktua' || 'Contacto') }}</h3>

        <ul class="footer-links">
          <li>
            <a href="mailto:lakobrakolektiboa@gmail.com" class="contact-link">
              lakobrakolektiboa@gmail.com
            </a>
          </li>
        </ul>

        <!-- MAPA DE UBICACIÓN -->
        <div class="mapa">
          <iframe
            src="https://www.google.com/maps?q=Top%20Team%20Bilbao%2C%20Deusto&output=embed"
            width="100%"
            height="200"
            style="border: 0; border-radius: 10px; margin-top: 12px"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <div class="col">
        <h3>{{ $t('footer.jarraitu') }}</h3>
        <div class="socials">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visitar nuestro Facebook"
            class="social-icon"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              fill="currentColor"
            >
              <path
                d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
              />
            </svg>
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visitar nuestro Twitter"
            class="social-icon"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              fill="currentColor"
            >
              <path
                d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"
              />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/lakobrakolektiboa/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visitar nuestro Instagram"
            class="social-icon"
          >
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              fill="currentColor"
            >
              <path
                d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <p>© 2026 Lakobra. {{ $t('footer.derechos') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  --footer-bg-start: #1e293b;
  --footer-bg-end: #0f172a;
  --footer-accent: #38bdf8;
  --footer-text-main: #f8fafc;
  --footer-text-muted: #94a3b8;
  --footer-text-links: #cbd5e1;
  --footer-border: rgba(255, 255, 255, 0.1);
  --footer-padding-top: 60px;
  --container-max-width: 1200px;
  --gap-large: 40px;
  --gap-small: 12px;

  width: 100%;
  background: linear-gradient(135deg, var(--footer-bg-start), var(--footer-bg-end));
  color: var(--footer-text-main);
  padding: var(--footer-padding-top) 0 0 0;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 25px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--gap-large);
}

.logo {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 15px;
  color: var(--footer-accent);
}

.description {
  line-height: 1.6;
  color: var(--footer-text-muted);
  max-width: 300px;
}

h3 {
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  color: white;
}

.mapa {
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: var(--gap-small);
}

.footer-links a,
.btn-login {
  color: var(--footer-text-links);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 15px;
  transition: color 0.3s ease, transform 0.2s ease;
  word-break: break-word;
}

.footer-links a:hover,
.btn-login:hover {
  color: var(--footer-accent);
}

.socials {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  margin-top: 5px;
}

.social-icon {
  color: var(--footer-text-links);
  display: inline-block;
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.social-icon svg {
  width: 100%;
  height: 100%;
}

.social-icon:hover {
  color: var(--footer-accent);
  transform: scale(1.15);
}

.bottom-bar {
  margin-top: 50px;
  padding: 25px 0;
  border-top: 1px solid var(--footer-border);
  text-align: center;
}

.bottom-bar p {
  font-size: 14px;
  color: var(--footer-text-muted);
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {
  .container {
    gap: 30px;
    padding: 0 20px;
  }

  .logo {
    font-size: 26px;
  }

  h3 {
    font-size: 15px;
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */
@media (max-width: 768px) {

  .container {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 25px;
    text-align: center;
  }

  .description {
    margin: 0 auto;
    max-width: 100%;
  }

  .socials {
    justify-content: center;
  }

  .logo {
    font-size: 24px;
  }

  h3 {
    font-size: 14px;
  }

  .footer-links a,
  .btn-login {
    font-size: 14px;
  }

  .bottom-bar {
    margin-top: 35px;
    padding: 20px 0;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {

  .container {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 15px;
  }

  .logo {
    font-size: 22px;
  }

  .description {
    font-size: 14px;
  }

  h3 {
    font-size: 13px;
    margin-bottom: 15px;
  }

  .footer-links li {
    margin-bottom: 8px;
  }

  .socials {
    gap: 1rem;
  }

  .bottom-bar p {
    font-size: 13px;
  }
}
</style>