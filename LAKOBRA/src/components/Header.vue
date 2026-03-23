<template>
  <header class="header">
    <!-- Espacio para el logo a la izquierda -->
    <!-- <div class="logo">
      <img src="/logo-lakobra.png" alt="Logo LAKOBRA" height="45" />
    </div> -->
    <nav class="nav">
      <ul class="lista">
        <li><RouterLink to="/login">Iniciar Sesión</RouterLink></li>
        <li><RouterLink to="/socios">Socios/as</RouterLink></li>
        <li><RouterLink to="/artistas">Artistas</RouterLink></li>
        <li><RouterLink to="/eventos">Eventos</RouterLink></li>
        <li><RouterLink to="/contacto">Contacto</RouterLink></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
:root {
  --color-bg-header: #111111;     
  --color-accent: #ff3f3f;      
  --color-text: #ffffff;          
  --spacing-header: 1.2rem;
  --transition-time: 0.3s;
}

.header {
  width: 100%;
  background: var(--color-bg-header);
  padding: var(--spacing-header);

  display: flex;
  align-items: center;
  justify-content: space-between;

  position: sticky;
  top: 0;
  z-index: 1000;

  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
}

/* .logo img {
  height: 45px;
} */

.nav {
  display: flex;
}

.lista {
  display: flex;
  gap: 1.8rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: bold;
  padding: 0.4rem 0.6rem;
  transition: color var(--transition-time), transform var(--transition-time);
}

a:hover {
  color: var(--color-accent);
  transform: translateY(-2px);
}

a.router-link-active {
  border-bottom: 3px solid var(--color-accent);
}
</style>