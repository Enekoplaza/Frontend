<script setup>
import { API_URL } from '../config'
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// 1. Comprobamos si hay un administrador logueado
const usuarioLocal = localStorage.getItem('usuarioLakobra');
const usuarioActivo = ref(usuarioLocal ? JSON.parse(usuarioLocal) : null);
const esAdmin = computed(() => usuarioActivo.value?.rol === 'admin');

const mostrarFormulario = ref(false);
const cargando = ref(false);
const solicitudes = ref([]); // Lista donde guardaremos lo que venga de la BD

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

// 2. Cargar las solicitudes (SOLO si es admin)
const cargarSolicitudes = async () => {
  if (!esAdmin.value) return; // Si no es admin, no hace nada
  try {
    const res = await fetch(`${API_URL}/api_artistas.php`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      solicitudes.value = data.solicitudes;
    }
  } catch (error) {
    console.error("Error al cargar solicitudes:", error);
  }
};

// 3. Cambiar el estado de la solicitud (Aceptar / Rechazar)
const cambiarEstado = async (id, nuevoEstado) => {
  try {
    const res = await fetch(`${API_URL}/api_artistas.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, estado: nuevoEstado })
    });
    const data = await res.json();
    
    if (data.success) {
      if (data.accion === 'aceptada') {
        Swal.fire({ 
          ...swalDarkConfig, 
          icon: 'success', 
          title: t('artistas.swal_aceptado_tit'), 
          text: t('artistas.swal_aceptado_msg') 
        });
      } else {
        Swal.fire({ 
          ...swalDarkConfig, 
          icon: 'info', 
          title: t('artistas.swal_rechazado_tit'), 
          text: t('artistas.swal_rechazado_msg'), 
          timer: 2000, 
          showConfirmButton: false 
        });
      }
      cargarSolicitudes(); // Recargamos la lista (la rechazada desaparecerá)
    }
  } catch (error) {
    console.error(error);
  }
};

// Se ejecuta al entrar a la página
onMounted(() => {
  cargarSolicitudes();
});

const enviarSolicitud = async () => {
  if (form.value.nombre_artista.length < 2 || form.value.descripcion.length < 10) {
    Swal.fire({ ...swalDarkConfig, icon: 'warning', title: t('artistas.swal_inc_titulo'), text: t('artistas.swal_inc_texto') });
    return;
  }
  cargando.value = true;
  try {
    const res = await fetch(`${API_URL}/api_artistas.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });
    const data = await res.json();
    if (data.success) {
      Swal.fire({ ...swalDarkConfig, icon: 'success', title: t('artistas.swal_ok_titulo'), text: t('artistas.swal_ok_texto') });
      form.value = { nombre_artista: '', email_contacto: '', descripcion: '' };
      mostrarFormulario.value = false;
      cargarSolicitudes(); 
    } else {
      Swal.fire({ ...swalDarkConfig, icon: 'error', title: 'Oops...', text: data.message });
    }
  } catch (error) {
    Swal.fire({ ...swalDarkConfig, icon: 'error', title: t('artistas.swal_err_titulo'), text: t('artistas.swal_err_texto') });
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="artistas-container">

    <div v-if="esAdmin" class="admin-seccion">
      <h2>🛠️ {{ $t('artistas.admin_titulo') }}</h2>

      <p v-if="solicitudes.length === 0" class="no-solicitudes">{{ $t('artistas.sin_solicitudes') }}</p>

      <div class="grid-solicitudes">
        <div v-for="solicitud in solicitudes" :key="solicitud.id" class="tarjeta-solicitud" :class="solicitud.estado">

          <div class="info-solicitud">
            <h3>🎤 {{ solicitud.nombre_artista }}</h3>
            <p class="email">✉️ {{ solicitud.email_contacto }}</p>
            <p class="fecha">📅 {{ solicitud.fecha_solicitud }}</p>
            <div class="descripcion-box">
              <p>{{ solicitud.descripcion }}</p>
            </div>
          </div>

          <div class="estado-acciones">
            <span :class="['badge', solicitud.estado]">{{ $t('artistas.estado_' + solicitud.estado) }}</span>

            <div class="botones-admin">
              <template v-if="solicitud.estado === 'pendiente'">
                <button @click="cambiarEstado(solicitud.id, 'aceptada')" class="btn-aceptar">
                  {{ $t('artistas.btn_aceptar') }}
                </button>
                <button @click="cambiarEstado(solicitud.id, 'rechazada')" class="btn-rechazar">
                  {{ $t('artistas.btn_rechazar') }}
                </button>
              </template>

              <template v-else-if="solicitud.estado === 'aceptada'">
                <button class="btn-listo" disabled>
                  ⭐ {{ $t('artistas.btn_listo_evento') }}
                </button>
              </template>
            </div>
          </div>

        </div>
      </div>
      <hr class="separador-admin">
    </div>

    <div v-if="!esAdmin" class="hero">
      <h1>{{ $t('artistas.titulo') }}</h1>
      <p class="intro">{{ $t('artistas.intro') }}</p>

      <button class="btn-llamada" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? $t('artistas.btn_ocultar') : $t('artistas.btn_mostrar') }}
      </button>
    </div>

    <div v-if="!esAdmin && mostrarFormulario" class="formulario-wrapper animate-fade-in">
      <h2>{{ $t('artistas.form_titulo') }}</h2>
      <form @submit.prevent="enviarSolicitud" class="form-artistas">

        <div class="form-group">
          <label>{{ $t('artistas.label_nombre') }}</label>
          <input v-model="form.nombre_artista" type="text" :placeholder="$t('artistas.ph_nombre')" required>
        </div>

        <div class="form-group">
          <label>{{ $t('artistas.label_email') }}</label>
          <input v-model="form.email_contacto" type="email" placeholder="tu@email.com" required>
        </div>

        <div class="form-group">
          <label>{{ $t('artistas.label_desc') }}</label>
          <textarea v-model="form.descripcion" rows="4" :placeholder="$t('artistas.ph_desc')" required></textarea>
        </div>

        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? $t('artistas.btn_enviando') : $t('artistas.btn_enviar') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* ESTILOS EXISTENTES */
.artistas-container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 2rem 1rem; 
  text-align: center; 
}

.hero {
  margin-top: 2rem;
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
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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

input,
textarea {
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
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
  transition: transform 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #7dd3fc;
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* NUEVOS ESTILOS PARA EL PANEL DE ADMIN */
.admin-seccion {
  background: rgba(30, 41, 59, 0.5);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 3rem;
  text-align: left;
  border: 1px solid #38bdf8;
}

.admin-seccion h2 {
  color: #38bdf8;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.separador-admin {
  border: 0;
  height: 1px;
  background: rgba(56, 189, 248, 0.3);
  margin-top: 3rem;
}

.no-solicitudes {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}

.grid-solicitudes { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 20px; 
}

.tarjeta-solicitud {
  background: #0f172a;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 5px solid transparent;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

/* Colores laterales según estado */
.tarjeta-solicitud.pendiente {
  border-left-color: #f59e0b;
}

.tarjeta-solicitud.aceptada {
  border-left-color: #10b981;
  opacity: 0.8;
}

.tarjeta-solicitud.rechazada {
  border-left-color: #ef4444;
  opacity: 0.6;
}

.info-solicitud h3 {
  color: #f8fafc;
  margin-bottom: 5px;
  font-size: 1.2rem;
}

.info-solicitud .email {
  color: #38bdf8;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.info-solicitud .fecha {
  color: #64748b;
  font-size: 0.8rem;
  margin-bottom: 15px;
}

.descripcion-box {
  background: #1e293b;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #cbd5e1;
  min-height: 80px;
  margin-bottom: 15px;
}

.estado-acciones {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.badge.pendiente {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.badge.aceptada {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.badge.rechazada {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.botones-admin {
  display: flex;
  gap: 10px;
  width: 100%;
}

.botones-admin button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  color: white;
}

.btn-aceptar {
  background: #10b981;
}

.btn-aceptar:hover {
  background: #059669;
}

.btn-rechazar {
  background: #ef4444;
}

.btn-rechazar:hover {
  background: #dc2626;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* Botón dorado para cuando la solicitud ya está aceptada */
.btn-listo {
  background: rgba(250, 204, 21, 0.1) !important;
  color: #facc15 !important;
  border: 1px solid #facc15 !important;
  cursor: default !important;
  width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>