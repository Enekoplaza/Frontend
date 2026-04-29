<script setup>
// 1. Importaciones
import { apiFetch } from '@/services/apiFetch'
import { ref, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// --- USUARIO (seguro) ---
const usuarioLocal = localStorage.getItem('usuarioLakobra')

let usuarioParseado = null
try {
  usuarioParseado = JSON.parse(usuarioLocal)
} catch (e) {
  usuarioParseado = null
}

const usuarioActivo = ref(usuarioParseado)

// --- ROLES ---
const esAdmin = computed(() => usuarioActivo.value?.rol === 'admin')
const esTxandalari = computed(() => usuarioActivo.value?.rol === 'txandalari')

// --- ESTADO ---
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

// --- VISIBILIDAD EVENTOS (CLAVE) ---
const eventosVisibles = computed(() => {
  const user = usuarioActivo.value

  // ❗ Filtramos SIEMPRE los finalizados
  const eventosActivos = eventos.value.filter(
    (e) => !esEventoFinalizado(e.fecha_evento)
  )

  // Admin o txandalari → ven todo lo NO finalizado
  if (user && (user.rol === 'admin' || user.rol === 'txandalari')) {
    return eventosActivos
  }

  // resto → solo confirmados y NO finalizados
  return eventosActivos.filter((e) => e.estado === 'confirmado')
})
const puedeAyudar = (evento) => {
  return (
    esTxandalari.value &&
    (evento.estado === 'pendiente' || evento.estado === 'confirmado') &&
    !esEventoFinalizado(evento.fecha_evento)
  )
}

// --- FECHAS ---
const obtenerFechaHoy = () => {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, '0')
  const day = String(hoy.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fechaHoy = obtenerFechaHoy()

const esEventoFinalizado = (fechaEvento) => {
  return fechaEvento < fechaHoy
}

// --- SWEETALERT ---
const swalDarkConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
  cancelButtonColor: '#475569',
}

// --- UTIL ---
const formatearHora = (horaString) => {
  if (!horaString) return ''
  return horaString.substring(0, 5)
}

// --- CARGAR EVENTOS ---
const cargarEventos = async () => {
  try {
    const data = await apiFetch('api_eventos.php')
    if (data.success) {
      eventos.value = data.eventos
    }
  } catch (error) {
    console.error('Error al cargar eventos', error)
  }
}

// --- POPUP AYUDA ---
const abrirPopupAyuda = async (evento) => {
  const { value: tarea } = await Swal.fire({
    ...swalDarkConfig,
    title: t('eventos.titulo_ayuda'),
    input: 'select',
    inputOptions: {
      sin_puesto: t('eventos.opt_sin_puesto'),
      puerta: t('eventos.opt_puerta'),
      barra: t('eventos.opt_barra'),
      limpieza: t('eventos.opt_limpieza'),
      otros: t('eventos.opt_otros'),
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
    },
  })

  if (tarea) {
    try {
      const data = await apiFetch('api_asistir.php', {
        method: 'POST',
        body: JSON.stringify({
          id_evento: evento.id,
          tarea: tarea,
        }),
      })

      if (data.success) {
        Swal.fire({
          ...swalDarkConfig,
          icon: 'success',
          title: t('eventos.swal_guardado'),
          timer: 1500,
          showConfirmButton: false,
        })

        cargarEventos()
      } else {
        Swal.fire({
          ...swalDarkConfig,
          icon: 'error',
          title: 'Error',
          text: data.message,
        })
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
  formEvento.value = {
    titulo: '',
    fecha_evento: '',
    hora_inicio: '',
    aforo_max: 120,
    estado: 'pendiente',
  }
}

const guardarEvento = async () => {
  const method = modoEdicion.value ? 'PUT' : 'POST'
  const payload = modoEdicion.value
    ? { ...formEvento.value, id: idEditando.value }
    : formEvento.value

  try {
    const data = await apiFetch('api_eventos.php', {
      method,
      body: JSON.stringify(payload),
    })

    if (data.success) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'success',
        title: t('eventos.swal_guardado'),
        timer: 1500,
        showConfirmButton: false,
      })

      cancelarFormulario()
      cargarEventos()
    }
  } catch (error) {
    Swal.fire({
      ...swalDarkConfig,
      icon: 'error',
      title: t('eventos.swal_err_con'),
    })
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
    cancelButtonText: t('eventos.btn_cancelar'),
  })

  if (confirmacion.isConfirmed) {
    try {
      await apiFetch('api_eventos.php', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      })

      cargarEventos()
    } catch (error) {
      console.error(error)
    }
  }
}

// --- INIT ---
onMounted(cargarEventos)
</script>
<template>
  <div class="eventos-container">
    <!-- HEADER SIEMPRE VISIBLE -->
    <div class="header-eventos">
      <h1>{{ $t('eventos.titulo') }}</h1>

      <button v-if="esAdmin" class="btn-admin" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? $t('eventos.btn_cancelar') : $t('eventos.btn_crear') }}
      </button>
    </div>

    <!-- PANEL ADMIN -->
    <div v-if="esAdmin && mostrarFormulario" class="admin-panel">
      <h2>{{ modoEdicion ? $t('eventos.edit_titulo') : $t('eventos.new_titulo') }}</h2>

      <form @submit.prevent="guardarEvento" class="form-grid">
        <input
          v-model="formEvento.titulo"
          type="text"
          :placeholder="$t('eventos.ph_titulo')"
          required
        />
        <input v-model="formEvento.fecha_evento" type="date" :min="fechaHoy" required />
        <input v-model="formEvento.hora_inicio" type="time" required />
        <input
          v-model="formEvento.aforo_max"
          type="number"
          :placeholder="$t('eventos.ph_aforo')"
          required
        />

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

    <!-- GRID EVENTOS (FILTRADOS AUTOMÁTICAMENTE) -->
    <div class="grid-eventos">
      <p v-if="eventosVisibles.length === 0" class="no-eventos">
        {{ $t('eventos.vacio') }}
      </p>

      <div v-for="evento in eventosVisibles" :key="evento.id" class="tarjeta-evento">
        <!-- ACCIONES ADMIN -->
        <div v-if="esAdmin" class="admin-actions">
          <button @click="prepararEdicion(evento)" class="btn-icon">✏️</button>
          <button @click="borrarEvento(evento.id)" class="btn-icon delete">🗑️</button>
        </div>

        <!-- INFO -->
        <div class="evento-info">
          <h3>{{ evento.titulo }}</h3>

          <p class="fecha">
            📅 {{ evento.fecha_evento }} 🕒 {{ formatearHora(evento.hora_inicio) }}
          </p>

          <p class="aforo">
            👥 {{ $t('eventos.plazas') }} <strong>{{ evento.plazas_libres }}</strong> /
            {{ evento.aforo_max }}
          </p>

          <span v-if="esEventoFinalizado(evento.fecha_evento)" class="badge finalizado">
            {{ $t('eventos.estado_finalizado') }}
          </span>

          <span v-else :class="['badge', evento.estado]">
            {{ $t('eventos.estado_' + evento.estado) }}
          </span>
        </div>

        <!-- FOOTER BOTONES -->
        <div class="footer-tarjeta">
          <template v-if="esEventoFinalizado(evento.fecha_evento)">
            <button class="btn-lleno" disabled>
              {{ $t('eventos.evento_finalizado') }}
            </button>
          </template>

          <template v-else>
            <!-- 🟢 TXANDALARI: AYUDA (AHORA TAMBIÉN EN CONFIRMADOS) -->
            <button
              v-if="puedeAyudar(evento)"
              class="btn-ayuda"
              :class="{ apuntado: evento.estoy_apuntado }"
              :disabled="evento.estoy_apuntado"
              @click="abrirPopupAyuda(evento)"
            >
              <template v-if="evento.estoy_apuntado">
                {{ $t('eventos.btn_apuntado') }}
              </template>

              <template v-else>
                <div class="anillo-pulso-verde"></div>
                {{ $t('eventos.btn_ayuda') }}
              </template>
            </button>

            <!-- 🔒 NO TXANDALARI -->
            <button v-else-if="evento.estado === 'pendiente'" class="btn-proximamente" disabled>
              <div class="anillo-pulso-pequeno"></div>
              {{ $t('eventos.btn_proximamente') }}
            </button>

            <!-- 🚫 CANCELADO -->
            <button v-else-if="evento.estado === 'cancelado'" class="btn-lleno" disabled>
              🚫 {{ $t('eventos.estado_cancelado') }}
            </button>

            <!-- ℹ️ CONFIRMADO (sin txandalari) -->
            <div v-else class="msg-abierto">
              {{ $t('eventos.evento_abierto') }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.eventos-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

/* HEADER */
.header-eventos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 1rem;
  gap: 1rem;
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

/* ADMIN PANEL */
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

/* GRID EVENTOS */
.grid-eventos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* TARJETA */
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

/* ADMIN ACTIONS */
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

/* INFO EVENTO */
.evento-info h3 {
  color: #f8fafc;
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.evento-info p {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* BADGES */
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
.badge.finalizado {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border: 1px solid #475569;
}

/* BOTONES */
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
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
}

.btn-ayuda:hover:not(:disabled) {
  background: #a3af04;
  transform: scale(1.02);
}

.btn-ayuda.apuntado {
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
  border: 1px solid #10b981 !important;
  cursor: default !important;
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

/* PULSOS */
.anillo-pulso-pequeno {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulso-naranja 2s infinite;
}

.anillo-pulso-verde {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulso-verde-anim 2s infinite;
}

/* AVISO PRIVADO */
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

/* ANIMACIONES */
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

/* SWEETALERT FIX */
:deep(.swal2-select) {
  background-color: #0f172a !important;
  color: white !important;
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {
  .eventos-container {
    padding: 1.5rem;
  }

  .grid-eventos {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }

  .evento-info h3 {
    font-size: 1.2rem;
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */
@media (max-width: 768px) {
  .eventos-container {
    padding: 1rem;
  }

  .header-eventos {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-admin {
    width: 100%;
  }

  .grid-eventos {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .tarjeta-evento {
    padding: 1.2rem;
  }

  .form-grid {
    flex-direction: column;
  }

  .form-grid input,
  .form-grid select {
    min-width: 100%;
    font-size: 0.95rem;
  }

  .btn-submit {
    width: 100%;
  }

  .evento-info h3 {
    font-size: 1.1rem;
  }

  .evento-info p {
    font-size: 0.9rem;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {
  .eventos-container {
    padding: 0.8rem;
  }

  .tarjeta-evento {
    padding: 1rem;
  }

  .btn-ayuda,
  .btn-lleno,
  .btn-proximamente {
    padding: 10px;
    font-size: 0.95rem;
  }

  .badge {
    font-size: 0.75rem;
  }
}
</style>