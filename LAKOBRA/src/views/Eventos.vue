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
const eventosVisibles = computed(() => eventos.value)

// Valores iniciales por defecto en euskera
const formularioBase = () => ({
  titulo: '',
  fecha_evento: '',
  hora_inicio: '',
  aforo_max: 120,
  estado: 'pendiente',
  tareas: [
    { nombre_tarea: 'Taberna (Barra)', limite_usuarios: 4 },
    { nombre_tarea: 'Sarrera (Atea)', limite_usuarios: 2 },
    { nombre_tarea: 'Garbiketa', limite_usuarios: 2 }
  ]
})

const formEvento = ref(formularioBase())

// --- AGREGAR/QUITAR TAREAS ---
const agregarTareaInput = () => {
  formEvento.value.tareas.push({ nombre_tarea: '', limite_usuarios: 1 })
}
const eliminarTareaInput = (index) => {
  formEvento.value.tareas.splice(index, 1)
}

const obtenerFechaHoy = () => new Date().toISOString().split('T')[0]
const fechaHoy = obtenerFechaHoy()
const esEventoFinalizado = (fecha) => fecha < fechaHoy

const formatearFechaEU = (fechaStr) => {
  if (!fechaStr) return ''
  return new Intl.DateTimeFormat('eu-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(fechaStr))
}

const cargarEventos = async () => {
  try {
    const data = await apiFetch('api_eventos.php')
    if (data.success) eventos.value = data.eventos
  } catch (error) {
    console.error(error)
  }
}

// --- POPUP REVELAR DETALLES DESDE EL CALENDARIO ---
const verDetalleEvento = async (infoOEvento) => {
  if (!infoOEvento) return;

  // Extraemos el objeto real tanto si viene de FullCalendar como directo
  let evento = infoOEvento;
  if (infoOEvento.event && infoOEvento.event.extendedProps && infoOEvento.event.extendedProps.datosOriginales) {
    evento = infoOEvento.event.extendedProps.datosOriginales;
  }

  const titulo = evento.titulo || 'Ekitaldia'
  const fecha = evento.fecha_evento || ''
  const hora = evento.hora_inicio ? evento.hora_inicio.substring(0,5) : '00:00'
  const plazasLibres = evento.plazas_libres !== undefined ? evento.plazas_libres : '?'
  const aforoMax = evento.aforo_max || '?'

  let tareasHtml = ''
  if (evento.tareas && evento.tareas.length > 0) {
    tareasHtml = `
      <div style="margin-top: 15px; padding: 12px; background: #0f172a; border-radius: 6px; text-align: left; border: 1px solid #334155;">
        <h4 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 0.95rem;">Txandak / Lanpostuak:</h4>
    `
    evento.tareas.forEach(t => {
      const colorTexto = t.estoy_en_esta_tarea ? '#10b981' : '#e2e8f0'
      const checkApuntado = t.estoy_en_esta_tarea ? '<b>(Apuntatuta!) ✓</b>' : ''
      const colorCupo = t.ocupacion_actual >= t.limite_usuarios ? '#ef4444' : '#a1a1aa'
      
      tareasHtml += `
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: ${colorTexto}">
          <span>${t.nombre_tarea} ${checkApuntado}</span>
          <span style="color: ${colorCupo}"><strong>${t.ocupacion_actual} / ${t.limite_usuarios}</strong></span>
        </div>
      `
    })
    tareasHtml += `</div>`
  }

  const result = await Swal.fire({
    background: '#1e293b',
    color: '#f8fafc',
    title: `<span style="color: #38bdf8;">${titulo}</span>`,
    html: `
      <div style="font-size: 0.95rem; line-height: 1.6;">
        <p style="margin: 5px 0;">📅 <b>Data:</b> ${formatearFechaEU(fecha)}</p>
        <p style="margin: 5px 0;">🕒 <b>Ordutegia:</b> ${hora}</p>
        <p style="margin: 5px 0;">👥 <b>Plaza libreak (Bazkideak):</b> <span style="color: #10b981; font-weight:bold;">${plazasLibres}</span> / ${aforoMax}</p>
        ${tareasHtml}
      </div>
    `,
    showCancelButton: !esEventoFinalizado(fecha),
    confirmButtonColor: '#475569',
    cancelButtonColor: '#10b981',
    confirmButtonText: 'Itxi / Cerrar',
    cancelButtonText: 'Lagundu / Txanda hartu'
  })

  if (result.dismiss === Swal.DismissReason.cancel) {
    mostrarCalendario.value = false
    abrirPopupAyuda(evento)
  }
}

// --- POPUP PARA APUNTARSE ---
const abrirPopupAyuda = async (evento) => {
  if (!evento.tareas || evento.tareas.length === 0) {
    Swal.fire({ background: '#1e293b', color: '#fff', icon: 'info', text: 'Ez dago txandarik ekitaldi honetan.' })
    return;
  }

  const opcionesTareas = {}
  evento.tareas.forEach(t => {
    opcionesTareas[t.id] = `${t.nombre_tarea} (${t.ocupacion_actual}/${t.limite_usuarios})`
  })

  const { value: idTarea } = await Swal.fire({
    background: '#1e293b', color: '#f8fafc', confirmButtonColor: '#38bdf8', cancelButtonColor: '#475569',
    title: 'Aukeratu zure txanda',
    input: 'select',
    inputOptions: opcionesTareas,
    inputPlaceholder: 'Hautatu lan bat...',
    showCancelButton: true,
    confirmButtonText: 'Apuntatu',
    cancelButtonText: 'Utzi',
    inputValidator: (value) => {
      const seleccionada = evento.tareas.find(t => t.id == value)
      if (seleccionada && seleccionada.ocupacion_actual >= seleccionada.limite_usuarios) {
        return `Txanda hau beteta dago!`
      }
    }
  })

  if (idTarea) {
    const data = await apiFetch('api_asistir.php', {
      method: 'POST',
      body: JSON.stringify({ id_evento: evento.id, id_tarea: idTarea }),
    })
    if (data.success) {
      Swal.fire({ background: '#1e293b', color: '#fff', icon: 'success', title: 'Egina!', timer: 1500, showConfirmButton: false })
      cargarEventos()
    }
  }
}

const prepararEdicion = (evento) => {
  modoEdicion.value = true
  mostrarFormulario.value = true
  idEditando.value = evento.id
  formEvento.value = { ...evento, tareas: [...evento.tareas] }
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
  if (data.success) { cancelarFormulario(); cargarEventos(); }
}

const borrarEvento = async (id) => {
  const confirm = await Swal.fire({ background: '#1e293b', color: '#fff', icon: 'warning', showCancelButton: true, title: 'Ziur zaude?' })
  if (confirm.isConfirmed) {
    await apiFetch('api_eventos.php', { method: 'DELETE', body: JSON.stringify({ id }) })
    cargarEventos()
  }
}

onMounted(cargarEventos)
</script>
<template>
  <div class="eventos-container" style="padding: 20px;">
    
    <div class="header-eventos" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
      <h1 style="color: white; margin: 0;">{{ $t('eventos.titulo') }}</h1>
      
      <button
        v-if="usuarioActivo"
        style="background-color: #8b5cf6; margin-right: auto; margin-left: 15px; color: white; padding: 10px 15px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold;"
        @click="mostrarCalendario = true"
      >
        {{ $t('eventos.btn_ver_calendario') }}
      </button>

      <button v-if="esAdmin" @click="mostrarFormulario = !mostrarFormulario" style="background: #3b82f6; color: white; padding: 10px 15px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold;">
        {{ mostrarFormulario ? 'Utzi' : 'Ekitaldia Sortu' }}
      </button>
    </div>

    <div v-if="esAdmin && mostrarFormulario" style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 25px; color: white;">
      <h2 style="margin-top: 0; color: #38bdf8;">{{ modoEdicion ? 'Ekitaldia Editatu' : 'Ekitaldi Berria' }}</h2>
      <form @submit.prevent="guardarEvento" style="display: flex; flex-direction: column; gap: 15px;">
        <input v-model="formEvento.titulo" type="text" placeholder="Ekitaldiaren izenburua" required style="padding: 10px; background: #0f172a; color: white; border: 1px solid #334155; border-radius: 4px;" />
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          <label>Data:<input v-model="formEvento.fecha_evento" type="date" :min="fechaHoy" required style="width:100%; padding: 10px; background: #0f172a; color: white; border: 1px solid #334155; margin-top:5px;" /></label>
          <label>Hasiera ordua:<input v-model="formEvento.hora_inicio" type="time" required style="width:100%; padding: 10px; background: #0f172a; color: white; border: 1px solid #334155; margin-top:5px;" /></label>
          <label>Aforo Max:<input v-model="formEvento.aforo_max" type="number" required style="width:100%; padding: 10px; background: #0f172a; color: white; border: 1px solid #334155; margin-top:5px;" /></label>
        </div>

        <div style="background: #0f172a; padding: 15px; border-radius: 6px; border: 1px solid #334155;">
          <h4 style="margin: 0 0 12px 0; color: #38bdf8;">Txanden Banaketa / Lanpostuak</h4>
          <div v-for="(tarea, index) in formEvento.tareas" :key="index" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <input v-model="tarea.nombre_tarea" type="text" placeholder="Lanaren izena (Adib: Barra, Atea...)" required style="flex: 3; padding: 8px; background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px;" />
            <input v-model.number="tarea.limite_usuarios" type="number" min="1" placeholder="Muga" required style="width: 80px; padding: 8px; background: #1e293b; color: white; border: 1px solid #475569; border-radius: 4px;" />
            <button type="button" @click="eliminarTareaInput(index)" style="background: #ef4444; color: white; border: none; padding: 8px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
          </div>
          <button type="button" @click="agregarTareaInput" style="background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 5px;">+ Txanda Berria Gehitu</button>
        </div>

        <select v-model="formEvento.estado" style="padding: 10px; background: #0f172a; color: white; border: 1px solid #334155;">
          <option value="pendiente">Zain (Pendiente)</option>
          <option value="confirmado">Berretsia (Confirmado)</option>
          <option value="cancelado">Bertan behera (Cancelado)</option>
        </select>

        <button type="submit" style="background: #3b82f6; color: white; padding: 12px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Gorde Ekitaldia</button>
      </form>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
      <div v-for="evento in eventos" :key="evento.id" style="background: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; position: relative; color: white;">
        
        <div v-if="esAdmin" style="position: absolute; top: 15px; right: 15px; display: flex; gap: 8px;">
          <button @click="prepararEdicion(evento)" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">✏️</button>
          <button @click="borrarEvento(evento.id)" style="background: none; border: none; cursor: pointer; font-size: 1.1rem;">🗑️</button>
        </div>

        <h3 style="margin-top: 0; padding-right: 40px; color: #f8fafc;">{{ evento.titulo }}</h3>
        <p style="font-size: 0.9rem; color: #94a3b8; margin: 5px 0;">📅 <span style="text-transform: capitalize;">{{ formatearFechaEU(evento.fecha_evento) }}</span> | 🕒 {{ evento.hora_inicio.substring(0,5) }}</p>
        <p style="font-size: 0.9rem; color: #cbd5e1;">👥 Plazak: <strong>{{ evento.plazas_libres }}</strong> / {{ evento.aforo_max }}</p>

        <div style="background: #0f172a; padding: 12px; border-radius: 6px; margin-top: 15px; border: 1px solid #334155;">
          <h4 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 0.9rem;">Txandak / Lanpostuak ({{ evento.txandalaris_apuntados }} / {{ evento.txandalaris_max }})</h4>
          <div v-for="t in evento.tareas" :key="t.id" style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05)">
            <span :style="{ color: t.estoy_en_esta_tarea ? '#10b981' : '#e2e8f0', fontWeight: t.estoy_en_esta_tarea ? 'bold' : 'normal' }">
              {{ t.nombre_tarea }} {{ t.estoy_en_esta_tarea ? '(Apuntatuta!)' : '' }}
            </span>
            <span :style="{ color: t.ocupacion_actual >= t.limite_usuarios ? '#ef4444' : '#a1a1aa' }">
              <strong>{{ t.ocupacion_actual }} / {{ t.limite_usuarios }}</strong>
            </span>
          </div>
        </div>

        <button v-if="!esEventoFinalizado(evento.fecha_evento)" @click="abrirPopupAyuda(evento)" style="margin-top: 15px; width: 100%; padding: 10px; background: #10b981; border: none; color: white; border-radius: 4px; font-weight: bold; cursor: pointer;">
          Lagundu / Txanda hartu
        </button>
      </div>
    </div>

    <CalendarioModal
      :mostrar="mostrarCalendario"
      :eventos="eventosVisibles"
      :usuario="usuarioActivo"
      @cerrar="mostrarCalendario = false"
      @seleccionar-evento="verDetalleEvento"
    />

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