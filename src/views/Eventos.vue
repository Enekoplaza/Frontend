<script setup>
import { apiFetch } from '@/services/apiFetch'
import { ref, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
import CalendarioModal from '@/components/CalendarioModal.vue'

const { t } = useI18n()

// --- ESTADO USUARIO ---
const usuarioLocal = localStorage.getItem('usuarioLakobra')
const usuarioActivo = ref(usuarioLocal ? JSON.parse(usuarioLocal) : null)
const esAdmin = computed(() => usuarioActivo.value?.rol === 'admin')
const esTxandalari = computed(() => usuarioActivo.value?.rol === 'txandalari')

// --- ESTADO COMPONENTE ---
const eventos = ref([])
const mostrarFormulario = ref(false)
const mostrarCalendario = ref(false)
const modoEdicion = ref(false)
const idEditando = ref(null)

// Reactividad limpia para el calendario
const eventosVisibles = computed(() => {
  const user = usuarioActivo.value
  if (user && (user.rol === 'admin' || user.rol === 'txandalari')) {
    return eventos.value
  }
  return eventos.value.filter((e) => e.estado === 'confirmado')
})

// CONFIGURACIÓN GLOBAL SWEETALERT (Fuerza la capa superior por encima del calendario)
const swalDarkConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
  cancelButtonColor: '#475569',
  customClass: {
    container: 'swal2-superior-layer' // Clase de respaldo para forzar z-index en CSS si hiciera falta
  }
}

const cancelarAsistenciaEvento = async (evento) => {
  const confirm = await Swal.fire({
    ...swalDarkConfig,
    icon: 'warning',
    showCancelButton: true,
    title: '¿Cancelar asistencia?',
    text: 'Se eliminará tu turno en este evento.',
    confirmButtonText: 'Sí, cancelar',
    cancelButtonText: 'Volver',
  })

  if (confirm.isConfirmed) {
    const data = await apiFetch('api_asistir.php', {
      method: 'POST',
      body: JSON.stringify({ id_evento: evento.id, cancelar: true }),
    })
    if (data.success) {
      Swal.fire({
        ...swalDarkConfig,
        icon: 'info',
        title: 'Turno cancelado',
        timer: 1500,
        showConfirmButton: false,
      })
      cargarEventos()
    }
  }
}

const formularioBase = () => ({
  titulo: '',
  fecha_evento: '',
  hora_inicio: '',
  aforo_max: 120,
  estado: 'pendiente',
  max_puerta: 2,
  max_barra: 2,
  max_limpieza: 2,
  max_otros: 2,
})

const formEvento = ref(formularioBase())

const obtenerFechaHoy = () => new Date().toISOString().split('T')[0]
const fechaHoy = obtenerFechaHoy()
const esEventoFinalizado = (fecha) => fecha < fechaHoy

const cargarEventos = async () => {
  try {
    const data = await apiFetch('api_eventos.php')
    if (data.success) eventos.value = data.eventos
  } catch (error) {
    console.error(error)
  }
}

const puedeAyudar = (evento) => {
  const topeTxandalaris =
    (evento.max_puerta || 2) +
    (evento.max_barra || 2) +
    (evento.max_limpieza || 2) +
    (evento.max_otros || 2)
  return (
    (esTxandalari.value || esAdmin.value) &&
    (evento.estado === 'pendiente' || evento.estado === 'confirmado') &&
    !esEventoFinalizado(evento.fecha_evento) &&
    (evento.txandalaris_apuntados || 0) < topeTxandalaris
  )
}

// --- DETALLES DESDE EL CALENDARIO (CORREGIDO PARA TRAER AL FRENTE) ---
const verDetalleEvento = async (infoOEvento) => {
  if (!infoOEvento) return

  let evento = infoOEvento
  if (infoOEvento.event && infoOEvento.event.extendedProps && infoOEvento.event.extendedProps.datosOriginales) {
    evento = infoOEvento.event.extendedProps.datosOriginales
  }

  const titulo = evento.titulo || 'Ekitaldia'
  const fecha = evento.fecha_evento || ''
  const hora = evento.hora_inicio ? evento.hora_inicio.substring(0, 5) : '00:00'
  const plazasLibres = evento.plazas_libres !== undefined ? evento.plazas_libres : '?'
  const aforoMax = evento.aforo_max || '?'

  const maxP = evento.max_puerta || 2
  const maxB = evento.max_barra || 2
  const maxL = evento.max_limpieza || 2
  const maxO = evento.max_otros || 2

  const tareasHtml = `
      <div style="margin-top: 15px; padding: 12px; background: #0f172a; border-radius: 6px; text-align: left; border: 1px solid #334155;">
        <h4 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 0.95rem;">Txandak:</h4>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0">
          <span>🚪 ${t('eventos.opt_puerta')}</span>
          <span style="color: ${(evento.ocupacion_puerta || 0) >= maxP ? '#ef4444' : '#10b981'}"><strong>${evento.ocupacion_puerta || 0} / ${maxP}</strong></span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0">
          <span>🍺 ${t('eventos.opt_barra')}</span>
          <span style="color: ${(evento.ocupacion_barra || 0) >= maxB ? '#ef4444' : '#10b981'}"><strong>${evento.ocupacion_barra || 0} / ${maxB}</strong></span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0">
          <span>🧹 ${t('eventos.opt_limpieza')}</span>
          <span style="color: ${(evento.ocupacion_limpieza || 0) >= maxL ? '#ef4444' : '#10b981'}"><strong>${evento.ocupacion_limpieza || 0} / ${maxL}</strong></span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; color: #e2e8f0">
          <span>🔧 ${t('eventos.opt_otros')}</span>
          <span style="color: ${(evento.ocupacion_otros || 0) >= maxO ? '#ef4444' : '#10b981'}"><strong>${evento.ocupacion_otros || 0} / ${maxO}</strong></span>
        </div>
      </div>
  `

  const result = await Swal.fire({
    ...swalDarkConfig,
    title: `<span style="color: #38bdf8;">${titulo}</span>`,
    html: `
      <div style="font-size: 0.95rem; line-height: 1.6;">
        <p style="margin: 5px 0;">📅 ${fecha}</p>
        <p style="margin: 5px 0;">🕒 ${hora}</p>
        <p style="margin: 5px 0;">👥 <b>${t('eventos.plazas')}</b> <span style="color: #10b981; font-weight:bold;">${plazasLibres}</span> / ${aforoMax}</p>
        ${esAdmin.value || esTxandalari.value ? tareasHtml : ''}
      </div>
    `,
    showCancelButton: !esEventoFinalizado(fecha) && puedeAyudar(evento) && !evento.estoy_apuntado,
    confirmButtonColor: '#475569',
    cancelButtonColor: '#10b981',
    confirmButtonText: t('eventos.btn_cancelar'),
    cancelButtonText: t('eventos.btn_ayuda'),
  })

  // Si el Txandalari le da a "Ayudar" desde el detalle del calendario
  if (result.dismiss === Swal.DismissReason.cancel) {
    mostrarCalendario.value = false // Cerramos el calendario para que no estorbe
    setTimeout(() => {
      abrirPopupAyuda(evento) // Lanzamos el selector de puestos
    }, 100)
  }
}

// --- POPUP RESTRICCIONES DE TRABAJO (CORREGIDO DE ESTILOS) ---
const abrirPopupAyuda = async (evento) => {
  const maxP = evento.max_puerta ?? 2
  const maxB = evento.max_barra ?? 2
  const maxL = evento.max_limpieza ?? 2
  const maxO = evento.max_otros ?? 2

  const { value: tarea } = await Swal.fire({
    ...swalDarkConfig,
    title: t('eventos.titulo_ayuda'),
    input: 'select',
    inputOptions: {
      puerta: `🚪 ${t('eventos.opt_puerta')} (${evento.ocupacion_puerta || 0}/${maxP})`,
      barra: `🍺 ${t('eventos.opt_barra')} (${evento.ocupacion_barra || 0}/${maxB})`,
      limpieza: `🧹 ${t('eventos.opt_limpieza')} (${evento.ocupacion_limpieza || 0}/${maxL})`,
      otros: `🔧 ${t('eventos.opt_otros')} (${evento.ocupacion_otros || 0}/${maxO})`,
    },
    inputPlaceholder: t('eventos.ph_ayuda'),
    showCancelButton: true,
    confirmButtonText: t('eventos.btn_confirmar'),
    cancelButtonText: t('eventos.btn_cancelar'),
    didOpen: () => {
      const select = Swal.getInput()

      // 🎨 FIX ESTILOS DESPLEGABLE: Aplicamos el modo oscuro por JS
      select.style.backgroundColor = '#0f172a'
      select.style.color = '#f8fafc'
      select.style.border = '1px solid #334155'
      select.style.borderRadius = '6px'
      select.style.padding = '10px'

      // Deshabilitar y oscurecer los puestos llenos
      if ((evento.ocupacion_puerta || 0) >= maxP) {
        let opt = select.querySelector('option[value="puerta"]')
        if (opt) { opt.disabled = true; opt.style.color = '#475569'; opt.style.backgroundColor = '#1e293b'; }
      }
      if ((evento.ocupacion_barra || 0) >= maxB) {
        let opt = select.querySelector('option[value="barra"]')
        if (opt) { opt.disabled = true; opt.style.color = '#475569'; opt.style.backgroundColor = '#1e293b'; }
      }
      if ((evento.ocupacion_limpieza || 0) >= maxL) {
        let opt = select.querySelector('option[value="limpieza"]')
        if (opt) { opt.disabled = true; opt.style.color = '#475569'; opt.style.backgroundColor = '#1e293b'; }
      }
      if ((evento.ocupacion_otros || 0) >= maxO) {
        let opt = select.querySelector('option[value="otros"]')
        if (opt) { opt.disabled = true; opt.style.color = '#475569'; opt.style.backgroundColor = '#1e293b'; }
      }
    },
  })

  if (tarea) {
    try {
      const data = await apiFetch('api_asistir.php', {
        method: 'POST',
        body: JSON.stringify({ id_evento: evento.id, tarea: tarea }),
      })

      if (data.success) {
        Swal.fire({
          ...swalDarkConfig,
          icon: 'success',
          title: t('eventos.swal_ok_conf'),
          text: t('eventos.btn_apuntado'),
          timer: 2000,
          showConfirmButton: false,
        })
        cargarEventos()
      } else {
        Swal.fire({ ...swalDarkConfig, icon: 'error', text: data.message })
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
}

const cancelarFormulario = () => {
  mostrarFormulario.value = false
  modoEdicion.value = false
  idEditando.value = null
  formEvento.value = formularioBase()
}

const guardarEvento = async () => {
  const method = modoEdicion.value ? 'PUT' : 'POST'
  const payload = modoEdicion.value ? { ...formEvento.value, id: idEditando.value } : formEvento.value

  const data = await apiFetch('api_eventos.php', { method, body: JSON.stringify(payload) })
  if (data.success) {
    cancelarFormulario()
    cargarEventos()
  }
}

const borrarEvento = async (id) => {
  const confirm = await Swal.fire({
    ...swalDarkConfig,
    icon: 'warning',
    showCancelButton: true,
    title: t('eventos.swal_warn_tit'),
    text: t('eventos.swal_warn_msg'),
    confirmButtonText: t('eventos.swal_btn_borrar'),
    cancelButtonText: t('eventos.btn_cancelar'),
  })

  if (confirm.isConfirmed) {
    await apiFetch(`api_eventos.php?id=${id}`, { method: 'DELETE' })
    cargarEventos()
  }
}

onMounted(cargarEventos)
</script>

<template>
  <div class="eventos-container">
    <div class="header-eventos">
      <h1>{{ $t('eventos.titulo') }}</h1>

      <div class="header-buttons">
        <button v-if="usuarioActivo" class="btn-calendario" @click="mostrarCalendario = true">
          📅 {{ $t('eventos.btn_ver_calendario') }}
        </button>

        <button v-if="esAdmin" @click="mostrarFormulario = !mostrarFormulario" class="btn-admin">
          {{ mostrarFormulario ? $t('eventos.btn_cancelar') : $t('eventos.btn_crear') }}
        </button>
      </div>
    </div>

    <div v-if="esAdmin && mostrarFormulario" class="admin-panel">
      <h2>{{ modoEdicion ? $t('eventos.edit_titulo') : $t('eventos.new_titulo') }}</h2>

      <form @submit.prevent="guardarEvento" class="form-evento">
        <input v-model="formEvento.titulo" type="text" :placeholder="$t('eventos.ph_titulo')" required
          class="input-form" />

        <div class="form-grid">
          <label>{{ $t('eventos.fecha_etiq') }}
            <input v-model="formEvento.fecha_evento" type="date" :min="fechaHoy" required class="input-form" />
          </label>
          <label>{{ $t('eventos.hora_etiq') }}
            <input v-model="formEvento.hora_inicio" type="time" required class="input-form" />
          </label>
          <label>{{ $t('eventos.ph_aforo') }}:
            <input v-model="formEvento.aforo_max" type="number" required class="input-form" />
          </label>
        </div>

        <div class="panel-puestos-form">
          <h4>{{ $t('eventos.distribucion_turnos') }}</h4>
          <div class="grid-puestos-form">
            <label>🚪 {{ $t('eventos.opt_puerta') }}
              <input v-model.number="formEvento.max_puerta" type="number" min="1" max="10" required
                class="input-form-sm" />
            </label>
            <label>🍺 {{ $t('eventos.opt_barra') }}
              <input v-model.number="formEvento.max_barra" type="number" min="1" max="10" required
                class="input-form-sm" />
            </label>
            <label>🧹 {{ $t('eventos.opt_limpieza') }}
              <input v-model.number="formEvento.max_limpieza" type="number" min="1" max="10" required
                class="input-form-sm" />
            </label>
            <label>🔧 {{ $t('eventos.opt_otros') }}
              <input v-model.number="formEvento.max_otros" type="number" min="1" max="10" required
                class="input-form-sm" />
            </label>
          </div>
        </div>

        <select v-model="formEvento.estado" class="select-form">
          <option value="pendiente">{{ $t('eventos.estado_pendiente') }}</option>
          <option value="confirmado">{{ $t('eventos.estado_confirmado') }}</option>
          <option v-if="modoEdicion" value="cancelado">{{ $t('eventos.estado_cancelado') }}</option>
        </select>

        <button type="submit" class="btn-submit">
          {{ modoEdicion ? $t('eventos.btn_actualizar') : $t('eventos.btn_guardar') }}
        </button>
      </form>
    </div>

    <div class="grid-eventos">
      <div v-for="evento in eventosVisibles" :key="evento.id" class="tarjeta-evento">
        <div v-if="esAdmin" class="admin-actions">
          <button @click="prepararEdicion(evento)" class="btn-icon">✏️</button>
          <button @click="borrarEvento(evento.id)" class="btn-icon delete">🗑️</button>
        </div>

        <div class="evento-info">
          <h3>{{ evento.titulo }}</h3>
          <p class="fecha">
            📅 <span>{{ evento.fecha_evento }}</span> | 🕒 {{ evento.hora_inicio.substring(0, 5) }}
          </p>
          <p class="aforo">
            👥 {{ $t('eventos.plazas') }} <strong>{{ evento.plazas_libres }}</strong> / {{ evento.aforo_max }}
          </p>
        </div>

        <div v-if="esAdmin || esTxandalari" class="info-puestos">
          <h4>
            {{ $t('eventos.turnos') }} ({{ evento.txandalaris_apuntados || 0 }} /
            {{ (evento.max_puerta || 2) + (evento.max_barra || 2) + (evento.max_limpieza || 2) + (evento.max_otros || 2)
            }})
          </h4>

          <div class="puesto-item">
            <span>🚪 {{ $t('eventos.opt_puerta') }}</span>
            <span :class="(evento.ocupacion_puerta || 0) >= (evento.max_puerta || 2) ? 'puesto-lleno' : 'puesto-libre'">
              <strong>{{ evento.ocupacion_puerta || 0 }} / {{ evento.max_puerta || 2 }}</strong>
            </span>
          </div>
          <div class="puesto-item">
            <span>🍺 {{ $t('eventos.opt_barra') }}</span>
            <span :class="(evento.ocupacion_barra || 0) >= (evento.max_barra || 2) ? 'puesto-lleno' : 'puesto-libre'">
              <strong>{{ evento.ocupacion_barra || 0 }} / {{ evento.max_barra || 2 }}</strong>
            </span>
          </div>
          <div class="puesto-item">
            <span>🧹 {{ $t('eventos.opt_limpieza') }}</span>
            <span
              :class="(evento.ocupacion_limpieza || 0) >= (evento.max_limpieza || 2) ? 'puesto-lleno' : 'puesto-libre'">
              <strong>{{ evento.ocupacion_limpieza || 0 }} / {{ evento.max_limpieza || 2 }}</strong>
            </span>
          </div>
          <div class="puesto-item">
            <span>🔧 {{ $t('eventos.opt_otros') }}</span>
            <span :class="(evento.ocupacion_otros || 0) >= (evento.max_otros || 2) ? 'puesto-lleno' : 'puesto-libre'">
              <strong>{{ evento.ocupacion_otros || 0 }} / {{ evento.max_otros || 2 }}</strong>
            </span>
          </div>
        </div>

        <div class="footer-tarjeta">
          <template v-if="esEventoFinalizado(evento.fecha_evento)">
            <button class="btn-lleno" disabled>{{ $t('eventos.evento_finalizado') }}</button>
          </template>

          <template v-else>
            <button v-if="puedeAyudar(evento) && !evento.estoy_apuntado" class="btn-ayuda"
              @click="abrirPopupAyuda(evento)">
              <div class="anillo-pulso-verde"></div>
              {{ $t('eventos.btn_ayuda') }}
            </button>

            <button v-else-if="evento.estoy_apuntado" class="btn-ayuda apuntado"
              @click="cancelarAsistenciaEvento(evento)">
              ✓ {{ $t('eventos.btn_apuntado') }}
            </button>

            <button
              v-else-if="(evento.txandalaris_apuntados || 0) >= ((evento.max_puerta || 2) + (evento.max_barra || 2) + (evento.max_limpieza || 2) + (evento.max_otros || 2)) && (esAdmin || esTxandalari)"
              class="btn-lleno" disabled>
              {{ $t('eventos.aforo_completo') }}
            </button>

            <button v-else-if="evento.estado === 'pendiente'" class="btn-proximamente" disabled>
              <div class="anillo-pulso-pequeno"></div>
              {{ $t('eventos.btn_proximamente') }}
            </button>

            <button v-else-if="evento.estado === 'cancelado'" class="btn-lleno btn-cancelado-aviso" disabled>
              🚫 {{ $t('eventos.estado_cancelado') }}
            </button>

            <div v-else class="msg-abierto">{{ $t('eventos.evento_abierto') }}</div>
          </template>
        </div>
      </div>
    </div>

    <CalendarioModal :mostrar="mostrarCalendario" :eventos="eventosVisibles" :usuario="usuarioActivo"
      @cerrar="mostrarCalendario = false" @seleccionar-evento="verDetalleEvento" />
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

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-admin {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn-calendario {
  background-color: #8b5cf6;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

/* ADMIN PANEL Y FORMULARIO */
.admin-panel {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid #38bdf8;
}

.admin-panel h2 {
  margin-top: 0;
  color: #38bdf8;
  margin-bottom: 1rem;
}

.form-evento {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.form-grid label {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: #94a3b8;
}

.input-form,
.select-form {
  width: 100%;
  padding: 10px;
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  border-radius: 6px;
  margin-top: 5px;
  box-sizing: border-box;
}

.input-form-sm {
  width: 100%;
  padding: 8px;
  background: #1e293b;
  color: white;
  border: 1px solid #475569;
  border-radius: 4px;
  margin-top: 5px;
  box-sizing: border-box;
}

.panel-puestos-form {
  background: #0f172a;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #334155;
}

.panel-puestos-form h4 {
  margin: 0 0 12px 0;
  color: #38bdf8;
}

.grid-puestos-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.grid-puestos-form label {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.btn-submit {
  background: #38bdf8;
  color: #0f172a;
  font-weight: bold;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

/* GRID EVENTOS */
.grid-eventos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  z-index: 10;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  font-size: 1.1rem;
}

/* INFO EVENTO */
.evento-info h3 {
  color: #f8fafc;
  margin-bottom: 10px;
  margin-top: 0;
  padding-right: 45px;
  font-size: 1.3rem;
}

.evento-info p {
  color: #94a3b8;
  font-size: 0.95rem;
  margin: 5px 0;
}

/* INFO PUESTOS (TXANDAK) */
.info-puestos {
  background: #0f172a;
  padding: 12px;
  border-radius: 6px;
  margin-top: 15px;
  border: 1px solid #334155;
}

.info-puestos h4 {
  margin: 0 0 8px 0;
  color: #38bdf8;
  font-size: 0.9rem;
}

.puesto-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.puesto-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.puesto-lleno {
  color: #ef4444;
}

.puesto-libre {
  color: #10b981;
}

/* FOOTER TARJETA & BOTONES */
.footer-tarjeta {
  margin-top: 15px;
}

.btn-ayuda {
  width: 100%;
  background: #e0dd16;
  color: rgb(0, 0, 0);
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
  background: #10b981;
  color: white;
  transform: scale(1.02);
}

.btn-ayuda.apuntado {
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
  border: 1px solid #10b981 !important;
  cursor: pointer !important;
}

.btn-lleno {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: #334155;
  color: #94a3b8;
  border: none;
  font-weight: bold;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-cancelado-aviso {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.btn-proximamente {
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
  font-weight: bold;
}

.msg-abierto {
  text-align: center;
  color: #10b981;
  font-weight: bold;
  padding-top: 10px;
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
  background: #22ec0f;
  box-shadow: 0 0 8px #22ec0f;
  animation: pulso-verde-anim 2s infinite;
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
    box-shadow: 0 0 0 0 rgba(34, 236, 15, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(34, 236, 15, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 236, 15, 0);
  }
}

/* SWEETALERT FIX */
:deep(.swal2-select) {
  background-color: #0f172a !important;
  color: white !important;
}

/* 🔥 SOLUCIÓN ARQUITECTURA DE CAPAS (Z-INDEX) 🔥 */
/* Forzamos a SweetAlert a saltar sobre el z-index nativo del calendario de Vue */
:global(.swal2-container) {
  z-index: 999999 !important;
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {
  .eventos-container {
    padding: 1.5rem;
  }

  .grid-eventos {
    grid-template-columns: repeat(2, 1fr);
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

  .header-buttons {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .btn-admin,
  .btn-calendario {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }

  .grid-eventos {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .tarjeta-evento {
    padding: 1.2rem;
  }

  .form-evento {
    flex-direction: column;
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
}
</style>