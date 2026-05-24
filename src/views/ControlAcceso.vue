<script setup>
import { apiFetch } from '@/services/apiFetch'
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'
// Importamos la librería del QR
import { Html5Qrcode } from 'html5-qrcode'
// Importamos librerías para el PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const dniInput = ref('')
const cargando = ref(false)
const resultado = ref(null)

const esAutorizado = ref(false)
const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLakobra') || '{}')

// --- NUEVO: ESTADO PARA EL ESCÁNER ---
const modoActivo = ref('dni') // 'dni' o 'qr'
let html5QrCode = null

onMounted(async () => {
  if (usuarioLocal.rol === 'admin' || usuarioLocal.rol === 'txandalari') {
    esAutorizado.value = true
    return
  }

  if (route.query.guest) {
    const data = await apiFetch(`api_validar_invitado.php?token=${route.query.guest}`)
    if (data.success) {
      esAutorizado.value = true
      Swal.fire({
        background: '#1e293b', color: '#f8fafc',
        title: t('puerta.swal_activo_tit'), text: t('puerta.swal_activo_msg'),
        icon: 'success', timer: 2500, showConfirmButton: false
      })
    } else {
      await Swal.fire({
        background: '#1e293b', color: '#f8fafc',
        title: t('puerta.swal_caducado_tit'), text: t('puerta.swal_caducado_msg'),
        icon: 'error', confirmButtonColor: '#38bdf8'
      })
      router.push('/principal')
    }
  } else {
    router.push('/principal')
  }
})

// --- LÓGICA DE LA CÁMARA ---
const cambiarModo = async (nuevoModo) => {
  modoActivo.value = nuevoModo
  resultado.value = null

  if (nuevoModo === 'qr') {
    await nextTick() // Esperar a que el div #reader exista en el DOM
    iniciarCamara()
  } else {
    detenerCamara()
  }
}

const iniciarCamara = async () => {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader")
  }

  const config = { fps: 10, qrbox: { width: 250, height: 250 } }
  const onScanSuccess = (textoDecodificado) => {
    detenerCamara()
    validarQR(textoDecodificado)
  }

  try {
    // 1. Pedimos al navegador que liste las cámaras (ESTO FUERZA EL AVISO DE PERMISOS)
    const devices = await Html5Qrcode.getCameras()

    if (devices && devices.length > 0) {
      // 2. Si encuentra cámaras, coge la principal (la webcam en tu PC)
      const cameraId = devices[0].id

      // 3. Inicia la lectura con esa cámara
      await html5QrCode.start(cameraId, config, onScanSuccess, () => { })
    } else {
      throw new Error("No se detectó ninguna cámara física")
    }
  } catch (err) {
    console.error("Error DETALLADO al acceder a la cámara:", err)

    let mensajeError = 'Revisa los permisos del navegador.'
    if (err.name === 'NotAllowedError') mensajeError = 'Has denegado el permiso o el SO lo bloquea.'
    if (err.name === 'NotFoundError') mensajeError = 'No se ha detectado ninguna cámara conectada al PC.'
    if (err.name === 'NotReadableError') mensajeError = 'Otra aplicación (Zoom, Skype) está usando la cámara.'

    Swal.fire({
      background: '#1e293b', color: '#f8fafc',
      title: 'Fallo de Cámara: ' + err.name,
      text: mensajeError,
      icon: 'error', confirmButtonColor: '#38bdf8'
    })
    cambiarModo('dni')
  }
}

const detenerCamara = () => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop().catch(err => console.error("Error deteniendo cámara", err))
  }
}

// Limpiar la cámara si cerramos la página
onBeforeUnmount(() => {
  detenerCamara()
})

// --- VALIDACIONES AL BACKEND ---
const validarDni = async () => {
  if (dniInput.value.trim() === '') return
  cargando.value = true
  resultado.value = null

  try {
    const data = await apiFetch('api_validar_acceso.php', {
      method: 'POST',
      body: JSON.stringify({ dni: dniInput.value.trim().toUpperCase() })
    })
    resultado.value = data
    if (data.estado === 'OK') dniInput.value = ''
  } catch (error) {
    resultado.value = { estado: 'error', mensaje: t('puerta.err_conexion') }
  } finally {
    cargando.value = false
  }
}

const validarQR = async (tokenQr) => {
  cargando.value = true
  resultado.value = null

  try {
    // Enviar solo el token, el PHP ya sabe quiénes somos por la cookie de sesión
    const data = await apiFetch('validar_qr.php', {
      method: 'POST',
      body: JSON.stringify({ token: tokenQr })
    })
    resultado.value = data
  } catch (error) {
    resultado.value = { estado: 'error', mensaje: t('puerta.err_conexion') }
  } finally {
    cargando.value = false
    // Esperamos 3 segundos y volvemos a encender la cámara para el siguiente
    setTimeout(() => {
      if (modoActivo.value === 'qr') iniciarCamara()
    }, 3000)
  }
}

const generarEnlace = async () => {
  try {
    const data = await apiFetch('api_generar_enlace.php')
    if (data.success) {
      const rutaCalculada = router.resolve({ path: '/puerta', query: { guest: data.token } }).href;
      const url = `${window.location.origin}${rutaCalculada}`;

      // 🔄 PLAN B CONTRA BLOQUEOS HTTP/CSP 🔄
      // Intentamos el método moderno, si falla, usamos el método clásico compatible con todo
      try {
        await navigator.clipboard.writeText(url)
      } catch (clipError) {
        console.warn("Llamando al plan B de copiado por restricciones HTTP/CSP");
        const inputTemporal = document.createElement('input');
        inputTemporal.value = url;
        document.body.appendChild(inputTemporal);
        inputTemporal.select();
        document.execCommand('copy'); // Comando clásico compatible con HTTP directo
        document.body.removeChild(inputTemporal);
      }

      Swal.fire({
        background: '#1e293b', color: '#f8fafc',
        title: t('puerta.swal_copiado_tit'), text: t('puerta.swal_copiado_msg'),
        icon: 'success', confirmButtonColor: '#38bdf8'
      })
    }
  } catch (e) {
    console.error("Error real en generarEnlace:", e);
    Swal.fire({
      background: '#1e293b', color: '#f8fafc', title: t('puerta.swal_err_tit'),
      text: t('puerta.swal_err_msg'), icon: 'error', confirmButtonColor: '#38bdf8'
    })
  }
}

// --- GENERAR PDF DE AFORO ---
const generarPDF = async () => {
  try {
    // 1. Pedir eventos
    const resEventos = await apiFetch('api_eventos.php')
    if (!resEventos.success || resEventos.eventos.length === 0) {
      return Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'info', title: t('puerta.pdf_no_eventos') })
    }

    // 2. Montar opciones para el Select
    const opcionesEventos = {}
    resEventos.eventos.forEach(e => {
      opcionesEventos[e.id] = `${e.titulo} (${e.fecha_evento})`
    })

    // 3. Preguntar al administrador de qué evento quiere el PDF
    const { value: idEventoElegido } = await Swal.fire({
      background: '#1e293b', color: '#f8fafc', confirmButtonColor: '#38bdf8', cancelButtonColor: '#475569',
      title: t('puerta.pdf_selecciona_evento'),
      input: 'select',
      inputOptions: opcionesEventos,
      inputPlaceholder: t('puerta.pdf_elige_evento'),
      showCancelButton: true,
      confirmButtonText: t('puerta.btn_generar_pdf'),
      cancelButtonText: t('puerta.btn_cancelar')
    })

    if (!idEventoElegido) return

    // 4. Mostrar cargando
    Swal.fire({ background: '#1e293b', color: '#f8fafc', title: t('puerta.pdf_generando'), allowOutsideClick: false, didOpen: () => Swal.showLoading() })

    const eventoSeleccionado = resEventos.eventos.find(e => e.id == idEventoElegido)

    // 5. Pedir la lista de asistentes reales al backend
    const resAsistentes = await apiFetch(`api_asistentes.php?id_evento=${idEventoElegido}`)
    if (!resAsistentes.success) throw new Error(t('puerta.pdf_err_lista'))

    // 6. Generar PDF
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor(56, 189, 248)
    doc.text(t('puerta.pdf_titulo_doc'), 14, 20)

    doc.setFontSize(11)
    doc.setTextColor(80, 80, 80)
    doc.text(`${t('puerta.pdf_evento')}: ${eventoSeleccionado.titulo}`, 14, 30)
    doc.text(`${t('puerta.pdf_fecha')}: ${eventoSeleccionado.fecha_evento}`, 14, 36)
    doc.text(`${t('puerta.pdf_total')}: ${resAsistentes.asistentes.length} / ${eventoSeleccionado.aforo_max}`, 14, 42)

    const filasTabla = resAsistentes.asistentes.map((asistente, index) => [
      index + 1,
      asistente.nombre,
      asistente.dni,
      asistente.fecha_hora_entrada
    ])

    autoTable(doc, {
      startY: 50,
      head: [[t('puerta.pdf_col_n'), t('puerta.pdf_col_nombre'), t('puerta.pdf_col_dni'), t('puerta.pdf_col_hora')]],
      body: filasTabla,
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] }
    })

    const nombreArchivo = `Aforo_${eventoSeleccionado.titulo.replace(/\s+/g, '_')}.pdf`
    doc.save(nombreArchivo)
    
    Swal.close()

  } catch (error) {
    console.error(error)
    Swal.fire({ background: '#1e293b', color: '#f8fafc', title: 'Error', text: t('puerta.pdf_err_generar'), icon: 'error', confirmButtonColor: '#38bdf8' })
  }
}
</script>

<template>
  <div class="control-acceso" v-if="esAutorizado">
    <div class="contenedor-herramienta">

      <header class="cabecera">
        <h1>🛡️ {{ $t('puerta.titulo') }}</h1>
        <p>{{ $t('puerta.subtitulo') }}</p>
      </header>

      <div v-if="usuarioLocal && usuarioLocal.rol === 'admin'" class="zona-admin" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button @click="generarEnlace" class="btn-enlace">
          🔗 {{ $t('puerta.btn_generar_enlace') }}
        </button>
        <button @click="generarPDF" style="background: transparent; color: #ef4444; border: 1px solid #ef4444; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s; width: 100%; margin-top: 5px;">
          {{ $t('puerta.btn_descargar_pdf') }}
        </button>
      </div>

      <div class="selector-modo">
        <button :class="['btn-tab', { activo: modoActivo === 'dni' }]" @click="cambiarModo('dni')">
          ⌨️ {{ $t('puerta.btn_teclado') }}
        </button>
        <button :class="['btn-tab', { activo: modoActivo === 'qr' }]" @click="cambiarModo('qr')">
          📷 {{ $t('puerta.btn_camara') }}
        </button>
      </div>

      <div v-if="modoActivo === 'dni'" class="formulario-validacion">
        <label>{{ $t('puerta.label_dni') }}</label>
        <div class="input-grupo">
          <input type="text" v-model="dniInput" :placeholder="$t('puerta.ph_dni')" @keyup.enter="validarDni"
            :disabled="cargando">
          <button @click="validarDni" :disabled="cargando || dniInput === ''" class="btn-validar">
            {{ cargando ? '...' : $t('puerta.btn_comprobar') }}
          </button>
        </div>
      </div>

      <div v-if="modoActivo === 'qr'" class="zona-camara">
        <p class="instruccion-qr">{{ $t('puerta.instruccion_qr') }}</p>
        <div id="reader" class="lector-qr"></div>
        <p v-if="cargando" class="cargando-texto">{{ $t('puerta.validando') }}</p>
      </div>

      <transition name="fade">
        <div v-if="resultado" class="panel-resultado"
          :class="resultado.estado?.toLowerCase().replace(' ', '-') || 'error'">

          <div v-if="resultado.estado === 'OK'" class="estado-ok">
            <span class="icono">✅</span>
            <h2>{{ $t('puerta.acceso_ok') }}</h2>
            <p><strong>{{ resultado.nombre }}</strong> {{ $t('puerta.puede_pasar') }}</p>
            <p class="aforo">{{ resultado.ocupacion }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Ya entró'" class="estado-aviso">
            <span class="icono">⚠️</span>
            <h2>{{ $t('puerta.entrada_dup') }}</h2>
            <p><strong>{{ resultado.nombre }}</strong> {{ $t('puerta.ya_entro') }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Aforo completo'" class="estado-error">
            <span class="icono">⛔</span>
            <h2>{{ $t('puerta.aforo_full') }}</h2>
            <p>{{ $t('puerta.no_mas') }}</p>
          </div>

          <div v-else-if="resultado.estado === 'Sin evento'" class="estado-error">
            <span class="icono">📅</span>
            <h2>{{ $t('puerta.sin_evento') }}</h2>
            <p>{{ $t('puerta.no_hay_evento') }}</p>
          </div>

          <div v-else class="estado-error">
            <span class="icono">❌</span>
            <h2>ERROR</h2>
            <p>{{ resultado.mensaje || $t('puerta.no_existe') }}</p>
          </div>

        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   CONTENEDORES PRINCIPALES
   ========================================= */
.control-acceso {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  padding: 2rem 1rem;
}

.contenedor-herramienta {
  background: #1e293b;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid #334155;
  text-align: center;
}

/* =========================================
   CABECERA
   ========================================= */
.cabecera h1 {
  color: #facc15;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.cabecera p {
  color: #94a3b8;
  margin-bottom: 2rem;
}

/* =========================================
   ZONA ADMIN (ENLACE)
   ========================================= */
.zona-admin {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.btn-enlace {
  background: transparent;
  color: #38bdf8;
  border: 1px solid #38bdf8;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
  width: 100%;
}

.btn-enlace:hover {
  background: rgba(56, 189, 248, 0.1);
}

/* =========================================
   FORMULARIO
   ========================================= */
.formulario-validacion {
  text-align: left;
  margin-bottom: 2rem;
}

.formulario-validacion label {
  display: block;
  color: #cbd5e1;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.input-grupo {
  display: flex;
  gap: 10px;
}

.input-grupo input {
  flex: 1;
  background: #0f172a;
  border: 2px solid #334155;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 1.1rem;
  outline: none;
  font-family: monospace;
}

.input-grupo input:focus {
  border-color: #facc15;
}

.btn-validar {
  background: #facc15;
  color: #0f172a;
  border: none;
  padding: 0 20px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-validar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-validar:hover:not(:disabled) {
  background: #eab308;
}

/* =========================================
   RESULTADOS Y ESTADOS
   ========================================= */
.panel-resultado {
  padding: 1.5rem;
  border-radius: 8px;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.icono {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.panel-resultado h2 {
  margin-bottom: 5px;
  font-size: 1.4rem;
}

.panel-resultado p {
  margin: 0;
  font-size: 1.1rem;
}

.aforo {
  margin-top: 10px !important;
  font-size: 0.9rem !important;
  opacity: 0.8;
}

.estado-ok {
  background: rgba(16, 185, 129, 0.2);
  border: 2px solid #10b981;
  color: #34d399;
}

.estado-aviso {
  background: rgba(245, 158, 11, 0.2);
  border: 2px solid #f59e0b;
  color: #fbbf24;
}

.estado-error {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid #ef4444;
  color: #f87171;
}

/* =========================================
   ANIMACIONES
   ========================================= */
@keyframes popIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================================
   SWEETALERT FIX (Estilo Oscuro Forzado)
   ========================================= */
:deep(.swal2-popup) {
  background-color: #1e293b !important;
  color: #f8fafc !important;
}

:deep(.swal2-title),
:deep(.swal2-html-container) {
  color: #f8fafc !important;
}

/* =========================================
   📱 RESPONSIVE (MEDIA QUERIES)
   ========================================= */
@media (max-width: 1024px) {
  .contenedor-herramienta {
    max-width: 450px;
    padding: 1.8rem;
  }

  .cabecera h1 {
    font-size: 1.7rem;
  }

  .input-grupo input {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .control-acceso {
    align-items: center;
    padding: 1.5rem 1rem;
  }

  .contenedor-herramienta {
    max-width: 100%;
    padding: 1.5rem;
    border-radius: 10px;
  }

  .cabecera h1 {
    font-size: 1.5rem;
  }

  .cabecera p {
    font-size: 0.95rem;
  }

  .input-grupo {
    flex-direction: column;
    gap: 12px;
  }

  .input-grupo input {
    font-size: 1rem;
    padding: 13px;
  }

  .btn-validar {
    width: 100%;
    padding: 12px;
  }

  .panel-resultado {
    padding: 1.2rem;
  }

  .icono {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .contenedor-herramienta {
    padding: 1.2rem;
  }

  .cabecera h1 {
    font-size: 1.3rem;
  }

  .cabecera p {
    font-size: 0.9rem;
  }

  .input-grupo input {
    font-size: 0.95rem;
  }

  .panel-resultado h2 {
    font-size: 1.2rem;
  }

  .panel-resultado p {
    font-size: 1rem;
  }

  .aforo {
    font-size: 0.85rem !important;
  }
}

/* --- ESTILOS NUEVOS PARA LAS PESTAÑAS Y CÁMARA --- */
.selector-modo {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #0f172a;
  padding: 5px;
  border-radius: 8px;
}

.btn-tab {
  flex: 1;
  background: transparent;
  color: #94a3b8;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-tab.activo {
  background: #38bdf8;
  color: #0f172a;
}

.zona-camara {
  margin-bottom: 20px;
}

.instruccion-qr {
  color: #cbd5e1;
  font-size: 0.95rem;
  margin-bottom: 10px;
}

.lector-qr {
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #334155;
  background-color: #000;
}

.cargando-texto {
  color: #facc15;
  font-weight: bold;
  margin-top: 10px;
  animation: parpadeo 1s infinite;
}

@keyframes parpadeo {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>