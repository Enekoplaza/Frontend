<script setup>
defineProps({
  usuario: Object
});

defineEmits(['abrirModal']);
</script>

<template>
  <footer class="footer">
    <div class="container">
      
      <div class="col">
        <h2 class="logo">Lakobra</h2>
        <p class="description">
          Tu portal para descubrir eventos y mucho más.
          Únete a la comunidad.
        </p>
      </div>

      <nav class="col">
        <h3>Enlaces</h3>
        <ul class="footer-links">
          <li><router-link to="/">Inicio</router-link></li>
          <li><router-link to="/loquesea">Loquesea</router-link></li>
          <li><router-link to="/eventos">Eventos</router-link></li>
          <li v-if="!usuario">
            <button class="btn-login" @click="$emit('abrirModal')">Iniciar sesión</button>
          </li>
        </ul>
      </nav>

      <div class="col">
        <h3>Síguenos</h3>
        <div class="socials">
          <a href="https://facebook.com" target="_blank" rel="noopener">Facebook</a>
          <a href="https://x.com" target="_blank" rel="noopener">X</a>
          <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>

    </div>

    <div class="bottom-bar">
      <p>© 2026 Lakobra. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
/* Definición de variables específicas para el componente */
.footer {
  /* Colores */
  --footer-bg-start: #1e293b;
  --footer-bg-end: #0f172a;
  --footer-accent: #38bdf8;
  --footer-text-main: #f8fafc;
  --footer-text-muted: #94a3b8;
  --footer-text-links: #cbd5e1;
  --footer-border: rgba(255, 255, 255, 0.1);
  
  /* Espaciados y Medidas */
  --footer-padding-top: 60px;
  --container-max-width: 1200px;
  --gap-large: 40px;
  --gap-small: 12px;

  /* Aplicación de las variables */
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: var(--gap-small);
}

.footer-links a, .btn-login {
  color: var(--footer-text-links);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 15px;
  transition: color 0.3s ease, transform 0.2s ease;
}

.footer-links a:hover, .btn-login:hover {
  color: var(--footer-accent);
}

.socials {
  display: flex;
  flex-direction: column;
  gap: var(--gap-small);
}

.socials a {
  color: var(--footer-text-links);
  text-decoration: none;
  transition: transform 0.2s ease, color 0.2s ease;
}

.socials a:hover {
  color: var(--footer-accent);
  transform: translateX(5px);
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

@media (max-width: 600px) {
  .container {
    text-align: center;
  }
  .description {
    margin: 0 auto;
  }
  .socials {
    align-items: center;
  }
}
</style>