<script setup>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';

// Intentamos recuperar el usuario del localStorage para saber si es admin
const usuarioLocal = localStorage.getItem('usuarioLakobra');
const usuarioActivo = ref(usuarioLocal ? JSON.parse(usuarioLocal) : null);

// Variable computada para saber si es Admin de forma rápida
const esAdmin = computed(() => usuarioActivo.value?.rol === 'admin');

const eventos = ref([]);
const mostrarFormulario = ref(false);

// Formulario para crear eventos
const formEvento = ref({
  titulo: '',
  fecha_evento: '',
  hora_inicio: '',
  aforo_max: 120,
  estado: 'confirmado'
});

const swalDarkConfig = { background: '#1e293b', color: '#f8fafc', confirmButtonColor: '#38bdf8' };

// --- NUEVO: Función para formatear la hora (de 22:00:00 a 22:00) ---
const formatearHora = (horaString) => {
  if (!horaString) return '';
  // Simplemente cortamos los últimos 3 caracteres (:ss)
  return horaString.substring(0, 5);
};

// Cargar los eventos al entrar a la página
const cargarEventos = async () => {
  try {
    const res = await fetch('http://localhost/Backend/api_eventos.php', {
      credentials: 'include' // <--- ¡ESTA ES LA LÍNEA MÁGICA QUE FALTABA!
    });
    const data = await res.json();
    if (data.success) {
      eventos.value = data.eventos;
    }
  } catch (error) {
    console.error("Error al cargar eventos", error);
  }
};

// Guardar un evento nuevo (Solo admin)
const crearEvento = async () => {
  try {
    const res = await fetch('http://localhost/Backend/api_eventos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEvento.value)
    });
    const data = await res.json();

    if (data.success) {
      Swal.fire({ ...swalDarkConfig, icon: 'success', title: 'Creado', text: 'Evento añadido a la cartelera.', timer: 1500, showConfirmButton: false });
      mostrarFormulario.value = false;
      cargarEventos(); // Recargamos la lista para que salga el nuevo
      formEvento.value = { titulo: '', fecha_evento: '', hora_inicio: '', aforo_max: 120, estado: 'confirmado' }; // Limpiamos
    } else {
      Swal.fire({ ...swalDarkConfig, icon: 'error', title: 'Error', text: data.message });
    }
  } catch (error) {
    Swal.fire({ ...swalDarkConfig, icon: 'error', title: 'Error', text: 'Error de conexión' });
  }
};

// Función para apuntarse o borrarse de un evento
const toggleAsistencia = async (evento) => {
  try {
    const res = await fetch('http://localhost/Backend/api_asistir.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE: Enviamos la cookie de sesión
      body: JSON.stringify({ id_evento: evento.id })
    });
    
    const data = await res.json();

    if (data.success) {
      const esApuntado = data.accion === 'apuntado';
      Swal.fire({
        ...swalDarkConfig,
        icon: esApuntado ? 'success' : 'info',
        title: esApuntado ? '¡Confirmado!' : 'Cancelado',
        text: data.message,
        timer: 1500,
        showConfirmButton: false
      });
      
      cargarEventos(); // Recargamos los eventos
    } else {
      Swal.fire({ ...swalDarkConfig, icon: 'warning', title: 'Aviso', text: data.message });
    }
  } catch (error) {
    console.error("Error en la asistencia", error);
  }
};

onMounted(() => {
  cargarEventos();
});
</script>

<template>
  <div class="eventos-container">
    <div class="header-eventos">
      <h1>Cartelera de Eventos</h1>
      
      <button v-if="esAdmin" class="btn-admin" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cancelar' : '+ Crear Nuevo Evento' }}
      </button>
    </div>

    <div v-if="esAdmin && mostrarFormulario" class="admin-panel">
      <h2>Nuevo Evento</h2>
      <form @submit.prevent="crearEvento" class="form-grid">
        <input v-model="formEvento.titulo" type="text" placeholder="Título del evento" required>
        <input v-model="formEvento.fecha_evento" type="date" required>
        <input v-model="formEvento.hora_inicio" type="time" required>
        <input v-model="formEvento.aforo_max" type="number" placeholder="Aforo Máx" required>
        <select v-model="formEvento.estado">
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button type="submit" class="btn-submit">Guardar Evento</button>
      </form>
    </div>

    <div class="grid-eventos">
      <p v-if="eventos.length === 0" class="no-eventos">Actualmente no hay eventos programados.</p>
      
      <div v-for="evento in eventos" :key="evento.id" class="tarjeta-evento">
        <div class="evento-info">
          <h3>{{ evento.titulo }}</h3>
          <p class="fecha">📅 {{ evento.fecha_evento }} a las 🕒 {{ formatearHora(evento.hora_inicio) }}</p>
          
          <p class="aforo" :style="{ color: evento.plazas_libres < 10 ? '#ef4444' : '#94a3b8' }">
            👥 Plazas libres: <strong>{{ evento.plazas_libres }}</strong> / {{ evento.aforo_max }}
          </p>
          <span :class="['badge', evento.estado]">{{ evento.estado }}</span>
        </div>
        
        <template v-if="usuarioActivo">
          <button v-if="evento.plazas_libres === 0 && !evento.estoy_apuntado" class="btn-lleno" disabled>
            Aforo Completo
          </button>
          <button v-else 
            :class="evento.estoy_apuntado ? 'btn-no-asistir' : 'btn-asistir'" 
            @click="toggleAsistencia(evento)">
            {{ evento.estoy_apuntado ? 'No asistir' : 'Asistir' }}
          </button>
        </template>
        
        <p v-else class="aviso-login">Inicia sesión para asistir</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eventos-container {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

.header-eventos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  color: var(--titulo);
}

.btn-admin {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}
.btn-admin:hover { transform: scale(1.05); }

.admin-panel {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #38bdf8;
}
.admin-panel h2 { color: #38bdf8; margin-bottom: 1rem; text-align: center; }

.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.form-grid input, .form-grid select {
  flex: 1;
  min-width: 150px;
  padding: 10px;
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  border-radius: 6px;
}
.btn-submit {
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

/* Tarjetas de eventos */
.grid-eventos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tarjeta-evento {
  background: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.tarjeta-evento:hover { 
  transform: translateY(-5px); 
  border-color: rgba(56, 189, 248, 0.3);
}

.evento-info h3 { color: #f8fafc; margin-bottom: 10px; font-size: 1.3rem; font-weight: 700; }
.evento-info p { color: #94a3b8; margin-bottom: 5px; font-size: 0.95rem; }

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 10px;
}
.badge.confirmado { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.badge.pendiente { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge.cancelado { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

/* CAMBIO: Botón Asistir (anterior apuntarse) - Azul */
.btn-asistir {
  margin-top: 15px;
  width: 100%;
  background: transparent;
  border: 2px solid #38bdf8;
  color: #38bdf8;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}
.btn-asistir:hover { background: #38bdf8; color: #0f172a; }

/* CAMBIO: Botón No Asistir (anterior borrarse) - Rojo desde el inicio */
.btn-no-asistir {
  margin-top: 15px;
  width: 100%;
  background: #ef4444; /* Rojo brillante de fondo */
  color: white;
  border: 2px solid #ef4444;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}
.btn-no-asistir:hover { background: #b91c1c; border-color: #b91c1c; } /* Rojo más oscuro en hover */

.btn-lleno {
  margin-top: 15px; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold;
  background: #334155; color: #94a3b8; border: none; cursor: not-allowed;
}

.aviso-login {
  margin-top: 15px;
  text-align: center;
  font-size: 0.85rem;
  color: #ef4444;
  font-weight: bold;
}
.no-eventos { color: var(--texto); font-style: italic; text-align: center; grid-column: 1 / -1; margin-top: 2rem; }
</style>