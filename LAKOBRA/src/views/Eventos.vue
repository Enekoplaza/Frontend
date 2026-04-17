<script setup>
import { API_URL } from '../config'
import { ref, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// --- ESTADO Y USUARIO ---
const usuarioLocal = localStorage.getItem('usuarioLakobra')
const usuarioActivo = ref(usuarioLocal ? JSON.parse(usuarioLocal) : null)

const esAdmin = computed(() => usuarioActivo.value?.rol === 'admin')
const esTxandalari = computed(() => usuarioActivo.value?.rol === 'txandalari')

const eventos = ref([])
const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const idEditando = ref(null)

const formEvento = ref({
  titulo: '',
  fecha_evento: '',
  hora_inicio: '',
  aforo_max: 150,
  estado: 'pendiente',
})

// --- LÓGICA DE FECHAS (NUEVO) ---
// Obtenemos la fecha de hoy en formato YYYY-MM-DD para bloquear el calendario
const obtenerFechaHoy = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const fechaHoy = obtenerFechaHoy();

// Función que comprueba si un evento ya es cosa del pasado
const esEventoFinalizado = (fechaEvento) => {
  return fechaEvento < fechaHoy;
};

const swalDarkConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
  cancelButtonColor: '#475569'
}

// --- FUNCIONES ---
const formatearHora = (horaString) => {
  if (!horaString) return ''
  return horaString.substring(0, 5)
}

const cargarEventos = async () => {
  try {
    const res = await fetch(`${API_URL}/api_eventos.php`, { credentials: 'include' })
    const data = await res.json()
    if (data.success) {
      eventos.value = data.eventos
    }
  } catch (error) {
    console.error('Error al cargar eventos', error)
  }
}

// POPUP DE AYUDA (TXANDALARIS)
const abrirPopupAyuda = async (evento) => {
  const { value: tarea } = await Swal.fire({
    ...swalDarkConfig,
    title: t('eventos.titulo_ayuda'),
    input: 'select',
    inputOptions: {
      'sin_puesto': t('eventos.opt_sin_puesto'),
      'puerta': t('eventos.opt_puerta'),
      'barra': t('eventos.opt_barra'),
      'limpieza': t('eventos.opt_limpieza'),
      'otros': t('eventos.opt_otros'),
    },
    inputPlaceholder: t('eventos.ph_ayuda'),
    showCancelButton: true,
    confirmButtonText: t('eventos.btn_confirmar'),
    cancelButtonText: t('eventos.btn_cancelar'),
    didOpen: () => {
      const input = Swal.getInput()
      input.style.backgroundColor = '#0f172a'
      input.style.color = '#ffffff'
      input.style.border = '1px solid #334155'
    }
  })

  if (tarea) {
    try {
      const res = await fetch(`${API_URL}/api_asistir.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id_evento: evento.id,
          tarea: tarea,
        }),
      })
      const data = await res.json()

      if (data.success) {
        Swal.fire({ ...swalDarkConfig, icon: 'success', title: t('eventos.swal_guardado'), timer: 1500, showConfirmButton: false })
        cargarEventos()
      } else {
        Swal.fire({ ...swalDarkConfig, icon: 'error', title: 'Error', text: data.message })
      }
    } catch (error) {
      console.error('Error al asignar tarea', error)
    }
  }
}

// --- CRUD ADMIN ---
const prepararEdicion = (evento) => {
  modoEdicion.value = true
  mostrarFormulario.value = true
  idEditando.value = evento.id
  formEvento.value = { ...evento }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelarFormulario = () => {
  mostrarFormulario.value = false
  modoEdicion.value = false
  idEditando.value = null
  formEvento.value = { titulo: '', fecha_evento: '', hora_inicio: '', aforo_max: 120, estado: 'pendiente' }
}

const guardarEvento = async () => {
  const method = modoEdicion.value ? 'PUT' : 'POST'
  const payload = modoEdicion.value ? { ...formEvento.value, id: idEditando.value } : formEvento.value
  try {
    const res = await fetch(`${API_URL}/api_eventos.php`, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (data.success) {
      Swal.fire({ ...swalDarkConfig, icon: 'success', title: t('eventos.swal_guardado'), timer: 1500, showConfirmButton: false })
      cancelarFormulario()
      cargarEventos()
    }
  } catch (error) {
    Swal.fire({ ...swalDarkConfig, icon: 'error', title: t('eventos.swal_err_con') })
  }
}

const borrarEvento = async (id) => {
  const confirmacion = await Swal.fire({
    ...swalDarkConfig,
    icon: 'warning',
    title: t('eventos.swal_warn_tit'),
    text: t('eventos.swal_warn_msg'),
    showCancelButton: true,
    confirmButtonText: t('eventos.swal_btn_borrar'),
    cancelButtonText: t('eventos.btn_cancelar')
  })

  if (confirmacion.isConfirmed) {
    try {
      await fetch(`${API_URL}/api_eventos.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })
      cargarEventos()
    } catch (error) { console.error(error) }
  }
}

onMounted(cargarEventos)
</script>

<template>
  <div class="eventos-container">

    <template v-if="usuarioActivo">
      <div class="header-eventos">
        <h1>{{ $t('eventos.titulo') }}</h1>
        <button v-if="esAdmin" class="btn-admin" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? $t('eventos.btn_cancelar') : $t('eventos.btn_crear') }}
        </button>
      </div>

      <div v-if="esAdmin && mostrarFormulario" class="admin-panel">
        <h2>{{ modoEdicion ? $t('eventos.edit_titulo') : $t('eventos.new_titulo') }}</h2>
        <form @submit.prevent="guardarEvento" class="form-grid">
          <input v-model="formEvento.titulo" type="text" :placeholder="$t('eventos.ph_titulo')" required />
          <input v-model="formEvento.fecha_evento" type="date" :min="fechaHoy" required />
          <input v-model="formEvento.hora_inicio" type="time" required />
          <input v-model="formEvento.aforo_max" type="number" :placeholder="$t('eventos.ph_aforo')" required />
          <select v-model="formEvento.estado">
            <option value="pendiente">{{ $t('eventos.estado_pendiente') }}</option>
            <option value="confirmado">{{ $t('eventos.estado_confirmado') }}</option>
            <option value="cancelado">{{ $t('eventos.estado_cancelado') }}</option>
          </select>
          <button type="submit" class="btn-submit">
            {{ modoEdicion ? $t('eventos.btn_actualizar') : $t('eventos.btn_guardar') }}
          </button>
        </form>
      </div>

      <div class="grid-eventos">
        <p v-if="eventos.length === 0" class="no-eventos">{{ $t('eventos.vacio') }}</p>

        <div v-for="evento in eventos" :key="evento.id" class="tarjeta-evento">
          <div v-if="esAdmin" class="admin-actions">
            <button @click="prepararEdicion(evento)" class="btn-icon">✏️</button>
            <button @click="borrarEvento(evento.id)" class="btn-icon delete">🗑️</button>
          </div>

          <div class="evento-info">
            <h3>{{ evento.titulo }}</h3>
            <p class="fecha">📅 {{ evento.fecha_evento }} 🕒 {{ formatearHora(evento.hora_inicio) }}</p>
            <p class="aforo">👥 {{ $t('eventos.plazas') }} <strong>{{ evento.plazas_libres }}</strong> / {{
              evento.aforo_max }}</p>
            <span v-if="esEventoFinalizado(evento.fecha_evento)" class="badge finalizado">
              {{ $t('eventos.estado_finalizado') }}
            </span>
            <span v-else :class="['badge', evento.estado]">
              {{ $t('eventos.estado_' + evento.estado) }}
            </span>
          </div>

          <div class="footer-tarjeta">
            <template v-if="esEventoFinalizado(evento.fecha_evento)">
              <button class="btn-lleno" disabled style="opacity: 0.6; cursor: not-allowed;">
                {{ $t('eventos.evento_finalizado') }}
              </button>
            </template>

            <template v-else>
              <template v-if="evento.estado === 'pendiente'">
                <button v-if="esTxandalari" 
                  class="btn-ayuda" 
                  :class="{ 'apuntado': evento.estoy_apuntado }"
                  :disabled="evento.estoy_apuntado"
                  @click="abrirPopupAyuda(evento)">
                  <template v-if="evento.estoy_apuntado">
                    {{ $t('eventos.btn_apuntado') }}
                  </template>
                  <template v-else>
                    <div class="anillo-pulso-verde"></div> {{ $t('eventos.btn_ayuda') }}
                  </template>
                </button>
                
                <button v-else class="btn-proximamente" disabled>
                  <div class="anillo-pulso-pequeno"></div> {{ $t('eventos.btn_proximamente') }}
                </button>
              </template>

              <button v-else-if="evento.estado === 'cancelado'" class="btn-lleno" disabled>🚫 {{ $t('eventos.estado_cancelado') }}</button>

              <div v-else class="msg-abierto">{{ $t('eventos.evento_abierto') }}</div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="aviso-privado">
      <div class="icon-lock">🔒</div>
      <h2>{{ $t('eventos.privado_tit') }}</h2>
      <p>{{ $t('eventos.privado_msg') }}</p>
      <router-link to="/login" class="btn-login-link">{{ $t('eventos.privado_btn') }}</router-link>
    </div>

  </div>
</template>

<style scoped>
.eventos-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.header-eventos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 1rem;
}

.btn-admin {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.admin-panel {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #38bdf8;
}

.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.form-grid input,
.form-grid select {
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

.grid-eventos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

@media (min-width: 1024px) {
  .grid-eventos {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tarjeta-evento {
  background: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
}

.evento-info h3 {
  color: #f8fafc;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.evento-info p {
  color: #94a3b8;
  font-size: 0.95rem;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 10px;
  text-transform: uppercase;
}

.badge.confirmado {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.badge.pendiente {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.badge.cancelado {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-ayuda {
  margin-top: 15px;
  width: 100%;
  background: #bcc905;
  color: #0f172a;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  /* Para centrar el círculo y el texto */
  align-items: center;
  /* Centrado vertical */
  justify-content: center;
  /* Centrado horizontal */
  gap: 10px;
  /* Espacio entre el círculo y la palabra */
  transition: all 0.2s ease;
}

.btn-ayuda:hover:not(:disabled) {
  background: #a3af04;
  /* Tono un pelín más oscuro al pasar el ratón */
  transform: scale(1.02);
}

.btn-ayuda.apuntado {
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
  border: 1px solid #10b981 !important;
  cursor: default !important;
  opacity: 1 !important;
  /* Evita que el navegador lo ponga gris al estar disabled */
}

.btn-lleno {
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: #334155;
  color: #94a3b8;
  border: none;
  cursor: not-allowed;
}

.btn-proximamente {
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.msg-abierto {
  margin-top: 15px;
  text-align: center;
  color: #10b981;
  font-weight: bold;
}

.anillo-pulso-pequeno {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulso-naranja 2s infinite;
}

/* Estilos aviso no registrado */
.aviso-privado {
  text-align: center;
  padding: 5rem 2rem;
  background: #1e293b;
  border-radius: 20px;
  border: 2px dashed #334155;
  margin-top: 2rem;
}

.icon-lock {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.btn-login-link {
  display: inline-block;
  margin-top: 2rem;
  background: #38bdf8;
  color: #0f172a;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: bold;
  text-decoration: none;
}

@keyframes pulso-naranja {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
}

/* Fix para el popup de SweetAlert2 */
:deep(.swal2-select) {
  background-color: #0f172a !important;
  color: white !important;
}

.anillo-pulso-verde {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulso-verde-anim 2s infinite;
}

@keyframes pulso-verde-anim {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.badge.finalizado {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border: 1px solid #475569;
}
</style>