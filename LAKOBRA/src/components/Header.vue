<template>
  <header class="header">
    <!-- Logo comentado por ahora -->
    <!--
    <div class="logo">
      <img src="/logo-lakobra.png" alt="Logo LAKOBRA" height="45" />
    </div>
    -->

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
  --header-bg: #0f4791;           
  --header-accent: #ff3f3f;       
  --header-text: #ffffff;          
  --header-spacing: 1rem;          
  --header-shadow: rgba(0,0,0,0.4); 
  --header-transition: 0.3s;       
}

.header {
  width: 100%;
  background-color: var(--header-bg);
  padding: var(--header-spacing);

  display: flex;
  align-items: flex-start;       
  justify-content: flex-end;    

  position: sticky;
  top: 0;
  z-index: 1000;

  box-shadow: 0 4px 10px var(--header-shadow);
}

.nav {
  display: flex;
}

.lista {
  display: flex;
  gap: 1.8rem;
  list-style: none;
  margin: 0;
  padding: 0;
  margin-top: 0.3rem; 
}

a {
  color: var(--header-text);
  text-decoration: none;
  font-weight: bold;
  padding: 0.4rem 0.6rem;
  transition: color var(--header-transition), transform var(--header-transition);
}

a:hover {
  color: var(--header-accent);
  transform: translateY(-2px);
}

a.router-link-active {
  border-bottom: 3px solid var(--header-accent);
}
</style>