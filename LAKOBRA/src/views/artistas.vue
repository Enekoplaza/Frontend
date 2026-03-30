<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';

const mostrarFormulario = ref(false);
const cargando = ref(false);

const form = ref({
  nombre_artista: '',
  email_contacto: '',
  descripcion: ''
});

const swalDarkConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
};

const enviarSolicitud = async () => {
  if (form.value.nombre_artista.length < 2 || form.value.descripcion.length < 10) {
    Swal.fire({
      ...swalDarkConfig,
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Por favor, explícanos un poco más qué haces (mín. 10 caracteres).'
    });
    return;
  }

  cargando.value = true;

  try {
    const res = await fetch('http://localhost/Backend/api_artistas.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    
    const data = await res.json();

    if (data.success) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'success',
        title: '¡Solicitud enviada!',
        text: 'Hemos recibido tu propuesta. Los administradores la revisarán pronto.'
      });
      // Limpiamos y ocultamos el formulario
      form.value = { nombre_artista: '', email_contacto: '', descripcion: '' };
      mostrarFormulario.value = false;
    } else {
      Swal.fire({ ...swalDarkConfig, icon: 'error', title: 'Oops...', text: data.message });
    }
  } catch (error) {
    Swal.fire({ ...swalDarkConfig, icon: 'error', title: 'Error', text: 'Problema de conexión' });
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="artistas-container">
    <div class="hero">
      <h1>Sube al escenario de Lakobra</h1>
      <p class="intro">
        ¿Quieres formar parte de nuestro equipo musical y ambientar los conciertos? 
        Ya seas cantante, DJ, animador o tengas una propuesta escénica diferente, 
        estamos buscando talentos locales para darles voz en nuestro espacio.
      </p>

      <button 
        class="btn-llamada" 
        @click="mostrarFormulario = !mostrarFormulario"
      >
        {{ mostrarFormulario ? 'Ocultar formulario' : '¿Quieres participar como Artista? ¡Click aquí!' }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="formulario-wrapper animate-fade-in">
      <h2>Envíanos tu propuesta</h2>
      <form @submit.prevent="enviarSolicitud" class="form-artistas">
        <div class="form-group">
          <label>Nombre Artístico / Grupo</label>
          <input v-model="form.nombre_artista" type="text" placeholder="Ej: Los Rockeros de Deusto" required>
        </div>

        <div class="form-group">
          <label>Email de Contacto</label>
          <input v-model="form.email_contacto" type="email" placeholder="tu@email.com" required>
        </div>

        <div class="form-group">
          <label>Cuéntanos sobre tu proyecto</label>
          <textarea v-model="form.descripcion" rows="4" placeholder="¿Qué estilo tocas? ¿Tienes experiencia? Déjanos enlaces a tu música si tienes..." required></textarea>
        </div>

        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Enviando...' : 'Enviar Solicitud' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.artistas-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  color: var(--titulo);
  margin-bottom: 1rem;
}

.intro {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--texto);
  margin-bottom: 2rem;
}

.btn-llamada {
  background: transparent;
  color: var(--boton-bg);
  border: 2px solid var(--boton-bg);
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(56, 189, 248, 0.2);
}

.btn-llamada:hover {
  background: var(--boton-bg);
  color: var(--boton-texto);
  transform: scale(1.05);
}

.formulario-wrapper {
  margin-top: 3rem;
  background: #1e293b; /* Fondo oscuro constante para el form */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  text-align: left;
}

.formulario-wrapper h2 {
  color: #38bdf8;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

label {
  color: #cbd5e1;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, textarea {
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

input:focus, textarea:focus {
  border-color: #38bdf8;
}

.btn-submit {
  width: 100%;
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  padding: 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.2s, background 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #7dd3fc;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>