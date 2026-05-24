<script setup>
import { apiFetch } from '@/services/apiFetch'
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import CalendarioModal from '@/components/CalendarioModal.vue'

const { t } = useI18n()

const props = defineProps({
  usuario: { type: Object, required: true },
})
const emit = defineEmits(['actualizar-usuario'])

const cargando = ref(false)
const modoEdicion = ref(false)
const abrirConfirmacion = ref(false)
const mostrarCalendario = ref(false)
const usuarioEditar = ref({})

// Listas separadas
const misEventos = ref([]) // Para la lista de abajo (solo tus turnos futuros)
const todosLosEventos = ref([]) // Para el calendario (toda la cartelera)

watch(
  () => props.usuario,
  (nuevoUsuario) => {
    if (nuevoUsuario) usuarioEditar.value = { ...nuevoUsuario }
  },
  { immediate: true, deep: true }
)

// --- LÓGICA DE FECHAS ----
const obtenerFechaHoy = () => {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, '0')
  const day = String(hoy.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatearFechaEU = (fechaStr) => {
  if (!fechaStr) return ''
  return new Intl.DateTimeFormat('eu-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(fechaStr))
}

// 1. Cargar SOLO mis eventos futuros (para la tarjeta de abajo)
const cargarMisEventos = async () => {
  try {
    const data = await apiFetch('api_perfil.php')
    if (data.success) {
      const fechaHoy = obtenerFechaHoy()
      misEventos.value = data.eventos.filter((evento) => evento.fecha_evento >= fechaHoy)
    }
  } catch (error) {
    console.error('Error eventos perfil:', error)
  }
}

// 2. Cargar TODOS los eventos (para el Calendario)
const cargarTodosLosEventos = async () => {
  try {
    const data = await apiFetch('api_eventos.php')
    if (data.success) {
      todosLosEventos.value = data.eventos
    }
  } catch (error) {
    console.error('Error cargando todos los eventos:', error)
  }
}

// 3. Reglas de visibilidad para el calendario del perfil
const eventosParaCalendario = computed(() => {
  const user = usuarioEditar.value
  if (user && (user.rol === 'admin' || user.rol === 'txandalari')) {
    return todosLosEventos.value
  }
  return todosLosEventos.value.filter((e) => e.estado === 'confirmado')
})

onMounted(() => {
  cargarMisEventos()
  cargarTodosLosEventos()
})

// --- POPUP INTERACTIVO DESDE EL CALENDARIO DEL PERFIL ---
const verDetalleEvento = async (evento) => {
  let tareasHtml = ''
  if (evento.tareas && evento.tareas.length > 0) {
    tareasHtml = `
      <div style="margin-top: 15px; padding: 12px; background: #0f172a; border-radius: 6px; text-align: left; border: 1px solid #334155;">
        <h4 style="margin: 0 0 8px 0; color: #38bdf8; font-size: 0.95rem;">Txandak / Lanpostuak:</h4>
    `
    evento.tareas.forEach((t) => {
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

  const fechaHoyStr = obtenerFechaHoy()
  const estaFinalizado = evento.fecha_evento < fechaHoyStr

  const result = await Swal.fire({
    background: '#1e293b',
    color: '#f8fafc',
    title: `<span style="color: #38bdf8;">${evento.titulo}</span>`,
    html: `
      <div style="font-size: 0.95rem; line-height: 1.6;">
        <p style="margin: 5px 0;">📅 <b>Data:</b> ${formatearFechaEU(evento.fecha_evento)}</p>
        <p style="margin: 5px 0;">🕒 <b>Ordutegia:</b> ${evento.hora_inicio.substring(0, 5)}</p>
        <p style="margin: 5px 0;">👥 <b>Plaza libreak (Bazkideak):</b> <span style="color: #10b981; font-weight:bold;">${
          evento.plazas_libres
        }</span> / ${evento.aforo_max}</p>
        ${tareasHtml}
      </div>
    `,
    showCancelButton: !estaFinalizado,
    confirmButtonColor: '#475569',
    cancelButtonColor: '#10b981',
    confirmButtonText: 'Itxi / Cerrar',
    cancelButtonText: 'Lagundu / Txanda hartu',
  })

  // Si pincha en "Lagundu", cerramos el calendario y lanzamos la asignación de turno
  if (result.dismiss === Swal.DismissReason.cancel) {
    mostrarCalendario.value = false
    abrirPopupAyuda(evento)
  }
}

// Flujo secundario para elegir txanda e inscribirse
const abrirPopupAyuda = async (evento) => {
  if (!evento.tareas || evento.tareas.length === 0) {
    Swal.fire({
      background: '#1e293b',
      color: '#fff',
      icon: 'info',
      text: 'Ez dago txandarik ekitaldi honetan.',
    })
    return
  }

  const opcionesTareas = {}
  evento.tareas.forEach((t) => {
    opcionesTareas[t.id] = `${t.nombre_tarea} (${t.ocupacion_actual}/${t.limite_usuarios})`
  })

  const { value: idTarea } = await Swal.fire({
    background: '#1e293b',
    color: '#f8fafc',
    confirmButtonColor: '#38bdf8',
    cancelButtonColor: '#475569',
    title: 'Aukeratu zure txanda',
    input: 'select',
    inputOptions: opcionesTareas,
    inputPlaceholder: 'Hautatu lan bat...',
    showCancelButton: true,
    confirmButtonText: 'Apuntatu',
    cancelButtonText: 'Utzi',
    inputValidator: (value) => {
      const seleccionada = evento.tareas.find((t) => t.id == value)
      if (seleccionada && seleccionada.ocupacion_actual >= seleccionada.limite_usuarios) {
        return `Txanda hau beteta dago!`
      }
    },
  })

  if (idTarea) {
    const data = await apiFetch('api_asistir.php', {
      method: 'POST',
      body: JSON.stringify({ id_evento: evento.id, id_tarea: idTarea }),
    })
    if (data.success) {
      Swal.fire({
        background: '#1e293b',
        color: '#fff',
        icon: 'success',
        title: 'Egina!',
        timer: 1500,
        showConfirmButton: false,
      })
      cargarMisEventos()
      cargarTodosLosEventos()
    }
  }
}

const cancelarEdicion = () => {
  usuarioEditar.value = { ...props.usuario }
  modoEdicion.value = false
}

const guardarCambios = async () => {
  try {
    const data = await apiFetch('api_perfil.php', {
      method: 'PUT',
      body: JSON.stringify(usuarioEditar.value),
    })

    if (data.success) {
      emit('actualizar-usuario', usuarioEditar.value)
      modoEdicion.value = false
      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        icon: 'success',
        title: t('perfil.msg_datos_ok'),
        timer: 1500,
        showConfirmButton: false,
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const confirmarSolicitud = async () => {
  abrirConfirmacion.value = false
  cargando.value = true
  try {
    const data = await apiFetch('api_perfil.php', { method: 'PATCH' })

    if (data.success) {
      usuarioEditar.value.solicitud_txandalari = 1
      usuarioEditar.value.solicitudTxandalari = 1
      emit('actualizar-usuario', usuarioEditar.value)
      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        icon: 'success',
        title: '¡Solicitud enviada!',
      })
    } else {
      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        icon: 'error',
        title: t('perfil.msg_err_enviar'),
      })
    }
  } catch (error) {
    Swal.fire({
      background: '#1e293b',
      color: '#f8fafc',
      icon: 'error',
      title: t('perfil.msg_err_conexion'),
    })
  } finally {
    cargando.value = false
  }
}

// Cancelar asistencia y turno
const cancelarAsistencia = async (id_evento) => {
  try {
    const data = await apiFetch('api_asistir.php', {
      method: 'POST',
      body: JSON.stringify({ id_evento }),
    })

    if (data.success) {
      cargarMisEventos()
      cargarTodosLosEventos()

      let mensajeAlerta = 'Cancelado'
      if (usuarioEditar.value.rol === 'admin' || usuarioEditar.value.rol === 'txandalari') {
        mensajeAlerta = 'Asistencia y turno cancelados'
      }

      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        icon: 'info',
        title: mensajeAlerta,
        timer: 1500,
        showConfirmButton: false,
      })
    }
  } catch (error) {
    console.error(error)
  }
}

const ampliarQR = () => {
  if (!usuarioEditar.value.qr_token) return

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${usuarioEditar.value.qr_token}`

  Swal.fire({
    background: '#1e293b',
    color: '#f8fafc',
    title: t('perfil.qr_titulo'),
    html: `
      <div class="qr-modal-wrapper">
        <img src="${qrUrl}" alt="QR" class="qr-modal-img"/>
      </div>
    `,
    backdrop: 'rgba(0, 0, 0, 0.9)',
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: 'qr-modal-popup',
      htmlContainer: 'qr-modal-container',
      closeButton: 'x-roja-modal',
    },
  })
}

const confirmarBaja = async () => {
  const result = await Swal.fire({
    background: '#1e293b',
    color: '#f8fafc',
    icon: 'warning',
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará tu cuenta definitivamente',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#334155',
    confirmButtonText: 'Sí, eliminar cuenta',
    cancelButtonText: 'Cancelar',
  })
  if (result.isConfirmed) {
    eliminarCuenta()
  }
}

const eliminarCuenta = async () => {
  try {
    const data = await apiFetch('api_perfil.php', { method: 'DELETE' })
    if (data.success) {
      await Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        icon: 'success',
        title: 'Cuenta eliminada',
      })
      window.location.href = '/'
    } else {
      Swal.fire({
        background: '#1e293b',
        color: '#f8fafc',
        icon: 'error',
        title: 'Error al eliminar la cuenta',
      })
    }
  } catch (error) {
    Swal.fire({
      background: '#1e293b',
      color: '#f8fafc',
      icon: 'error',
      title: 'Error de conexión',
    })
  }
}
</script>

<template>
  <div class="perfil">
    <div class="contenedor">
      <header class="cabecera-perfil">
        <div class="info-usuario">
          <h1>
            {{ $t('perfil.bienvenido') }} <span>{{ usuarioEditar.nombre || '...' }}</span>
          </h1>
        </div>
        <div class="etiqueta" :class="usuarioEditar.rol">{{ usuarioEditar.rol }}</div>
      </header>

      <div class="grid-principal">
        <aside class="barra-lateral">
          <section class="tarjeta qr-usuario">
            <h3><i class="icono">📱</i> {{ $t('perfil.qr_titulo') }}</h3>

            <div v-if="usuarioEditar.qr_token" class="qr-contenedor">
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${usuarioEditar.qr_token}`"
                alt="Mi Código QR"
                class="imagen-qr"
              />
              <p class="descripcion-qr">{{ $t('perfil.qr_desc') }}</p>
              <button @click="ampliarQR" class="btn-qr">{{ $t('perfil.btn_ampliar_qr') }}</button>
            </div>

            <div v-else class="qr-contenedor error">
              <p>Error: No se encontró el token de acceso.</p>
            </div>
          </section>

          <section class="tarjeta datos-usuario">
            <div class="cabecera-seccion">
              <h3><i class="icono">👤</i> {{ $t('perfil.mis_datos') }}</h3>
              <button
                v-if="!modoEdicion"
                @click="modoEdicion = true"
                class="boton-editar-icono"
                title="Editar"
              >
                ✏️
              </button>
            </div>

            <div v-if="!modoEdicion" class="vista-datos">
              <div class="grupo-dato">
                <label>{{ $t('perfil.nombre') }}</label>
                <p class="dato-texto">{{ usuarioEditar.nombre }}</p>
              </div>
              <div class="grupo-dato">
                <label>{{ $t('perfil.dni') }}</label>
                <p class="dato-texto">{{ usuarioEditar.dni }}</p>
              </div>
              <div class="grupo-dato">
                <label>{{ $t('perfil.email') }}</label>
                <p class="dato-texto">{{ usuarioEditar.email }}</p>
              </div>
              <div class="grupo-dato">
                <label>{{ $t('perfil.direccion') }}</label>
                <p class="dato-texto">{{ usuarioEditar.direccion }}</p>
              </div>
            </div>

            <div v-else class="formulario-edicion">
              <div class="grupo-dato">
                <label>{{ $t('perfil.nombre') }}</label
                ><input type="text" v-model="usuarioEditar.nombre" />
              </div>
              <div class="grupo-dato">
                <label>{{ $t('perfil.dni') }}</label
                ><input type="text" v-model="usuarioEditar.dni" />
              </div>
              <div class="grupo-dato">
                <label>{{ $t('perfil.email') }}</label
                ><input type="email" v-model="usuarioEditar.email" />
              </div>
              <div class="grupo-dato">
                <label>{{ $t('perfil.direccion') }}</label
                ><input type="text" v-model="usuarioEditar.direccion" />
              </div>

              <div class="botones-edicion">
                <button @click="guardarCambios" class="btn-guardar">
                  {{ $t('perfil.btn_guardar') }}
                </button>
                <button @click="cancelarEdicion" class="btn-cancelar">
                  {{ $t('perfil.btn_cancelar') }}
                </button>
              </div>

              <div class="zona-baja-cuenta" v-if="usuarioEditar.rol !== 'admin'">
                <button class="btn-cancelar-suscripcion" @click="confirmarBaja">
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </section>

          <section
            class="tarjeta estado-txandalari"
            :class="{
              activo:
                usuarioEditar.rol === 'txandalari' ||
                usuarioEditar.solicitud_txandalari == 1 ||
                usuarioEditar.solicitudTxandalari == 1,
            }"
          >
            <h3>🐍 {{ $t('perfil.estado_lakobra') }}</h3>

            <div
              v-if="usuarioEditar.rol === 'txandalari' || usuarioEditar.rol === 'admin'"
              class="estado-activo oficial"
            >
              <div class="anillo-pulso"></div>
              <div class="texto-estado">
                <span class="estado-principal">{{ $t('perfil.txan_oficial') }}</span>
                <span class="estado-secundario">{{ $t('perfil.txan_elite') }}</span>
              </div>
            </div>

            <div
              v-else-if="
                usuarioEditar.solicitud_txandalari == 1 || usuarioEditar.solicitudTxandalari == 1
              "
              class="estado-activo pendiente"
            >
              <div class="anillo-pulso azul"></div>
              <div class="texto-estado">
                <span class="estado-principal" style="color: #38bdf8">{{
                  $t('perfil.txan_pendiente')
                }}</span>
                <span class="estado-secundario">{{ $t('perfil.txan_espera') }}</span>
              </div>
            </div>

            <div v-else class="formulario-solicitud">
              <p class="titulo-formulario">{{ $t('perfil.quieres_txan') }}</p>
              <p class="descripcion-formulario">{{ $t('perfil.unete_club') }}</p>
              <button class="btn-txandalari" @click="abrirConfirmacion = true">
                {{ cargando ? $t('perfil.btn_enviando') : $t('perfil.btn_mandar_solicitud') }}
              </button>
            </div>

            <div v-if="abrirConfirmacion" class="modal-overlay">
              <div class="modal-contenido">
                <h4>{{ $t('perfil.conf_titulo') }}</h4>
                <p>{{ $t('perfil.conf_seguro') }}</p>
                <div class="botones-modal">
                  <button @click="confirmarSolicitud" class="btn-guardar">
                    {{ $t('perfil.btn_si_enviar') }}
                  </button>
                  <button @click="abrirConfirmacion = false" class="btn-cancelar">
                    {{ $t('perfil.btn_cancelar') }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <main class="contenido">
          <section class="tarjeta eventos">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
              "
            >
              <h3 style="margin: 0; padding-bottom: 0; border: none">
                <i class="icono">📅</i> {{ $t('perfil.mis_eventos') }}
              </h3>
              <button
                style="
                  background-color: #8b5cf6;
                  color: white;
                  border: none;
                  padding: 0.5rem 1rem;
                  border-radius: 8px;
                  font-weight: bold;
                  cursor: pointer;
                "
                @click="mostrarCalendario = true"
              >
                {{ $t('eventos.btn_ver_calendario') }}
              </button>
            </div>
            <div
              style="
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                margin-bottom: 1.5rem;
                margin-top: -0.5rem;
              "
            ></div>

            <div v-if="misEventos.length > 0" class="lista-eventos">
              <div v-for="evento in misEventos" :key="evento.id" class="evento-item">
                <div class="fecha-evento">
                  <span class="dia">{{ evento.fecha_evento.split('-')[2] }}</span>
                  <span class="mes">{{ evento.fecha_evento.split('-')[1] }}</span>
                </div>

                <div class="detalle-evento">
                  <h4>{{ evento.titulo }}</h4>
                  <p>🕒 {{ evento.hora_inicio.substring(0, 5) }}</p>

                  <div class="info-turno-fijo" v-if="evento.puesto" style="margin-top: 0.5rem">
                    <span
                      style="
                        color: #facc15;
                        font-size: 0.95rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                      "
                    >
                      🦺 <strong>{{ $t('perfil.turno_label') }}:</strong>
                      {{ $t('perfil.turno_' + evento.puesto) }}
                    </span>
                  </div>
                </div>
                <button @click="cancelarAsistencia(evento.id)" class="btn-anular">×</button>
              </div>
            </div>

            <div v-else class="estado-vacio">
              <p>{{ $t('perfil.no_eventos') }}</p>
            </div>
          </section>

          <section class="tarjeta" v-if="usuarioEditar.rol !== 'admin'">
            <h3><i class="icono">⚠️</i> Baja de socio</h3>
            <div class="zona-baja-socio">
              <p style="color: #94a3b8; margin-bottom: 1rem">
                Si deseas darte de baja como socio, puedes hacerlo en cualquier momento. Esta acción
                eliminará tu cuenta de forma permanente.
              </p>
              <button class="btn-cancelar-suscripcion" @click="confirmarBaja">Darse de baja</button>
            </div>
          </section>
        </main>
      </div>
    </div>

    <CalendarioModal
      :mostrar="mostrarCalendario"
      :eventos="eventosParaCalendario"
      :usuario="usuarioEditar"
      @cerrar="mostrarCalendario = false"
      @seleccionar-evento="verDetalleEvento"
    />
  </div>
</template><style scoped>
.perfil {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.contenedor {
  max-width: 1000px;
  margin: 0 auto;
}

.cabecera-perfil {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 1rem;
}

.cabecera-perfil h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--titulo);
}

.cabecera-perfil h1 span {
  color: #38bdf8;
}

.etiqueta {
  padding: 6px 16px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.85rem;
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
  text-transform: uppercase;
}

.etiqueta.admin {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-color: #ef4444;
}

.grid-principal {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.tarjeta {
  background: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.cabecera-seccion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.tarjeta h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.boton-editar-icono {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.boton-editar-icono:hover {
  background: #38bdf8;
}

.grupo-dato {
  margin-bottom: 1.2rem;
}

.grupo-dato label {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.dato-texto {
  font-weight: 500;
  color: #f8fafc;
  font-size: 1.05rem;
  margin: 0;
}

.formulario-edicion input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.formulario-edicion input:focus {
  border-color: #38bdf8;
}

.botones-edicion {
  display: flex;
  gap: 10px;
  margin-top: 1.5rem;
}

.botones-edicion button {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.btn-guardar {
  background: #38bdf8;
  color: #0f172a;
}

.btn-guardar:hover {
  background: #7dd3fc;
}

.btn-cancelar {
  background: #334155;
  color: #f8fafc;
}

.btn-cancelar:hover {
  background: #475569;
}

/* TXANDALARI */
.estado-txandalari {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid #334155;
}

.estado-txandalari.activo {
  border: 1px solid #facc15;
  box-shadow: 0 0 15px rgba(250, 204, 21, 0.1);
}

.estado-activo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 1rem;
}

.estado-principal {
  font-weight: 800;
  color: #facc15;
  display: block;
  font-size: 1.1rem;
}

.estado-secundario {
  font-size: 0.85rem;
  color: #94a3b8;
}

.btn-cancelar-suscripcion {
  width: 100%;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancelar-suscripcion:hover {
  background: #ef4444;
  color: white;
}

.anillo-pulso {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #facc15;
  animation: pulso 2s infinite;
  box-shadow: 0 0 10px #facc15;
}

.anillo-pulso.azul {
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
  animation: pulso-azul 2s infinite;
}

@keyframes pulso {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(250, 204, 21, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
  }
}

@keyframes pulso-azul {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(56, 189, 248, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
  }
}

.titulo-formulario {
  font-weight: bold;
  color: #f8fafc;
  margin: 1rem 0 0.5rem 0;
}

.descripcion-formulario {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn-txandalari {
  width: 100%;
  padding: 12px;
  background: rgba(250, 204, 21, 0.1);
  color: #facc15;
  border: 1px solid #facc15;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-txandalari:hover {
  background: #facc15;
  color: #0f172a;
}

/* EVENTOS */
.evento-item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1rem;
  background: #0f172a;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #334155;
  transition: transform 0.2s, border-color 0.2s;
}

.evento-item:hover {
  transform: translateX(5px);
  border-color: #38bdf8;
}

.fecha-evento {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  padding: 10px;
  border-radius: 8px;
  min-width: 65px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.dia {
  font-weight: 800;
  font-size: 1.4rem;
  line-height: 1;
}

.mes {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 2px;
}

.detalle-evento {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detalle-evento h4 {
  margin: 0;
  font-weight: 700;
  color: #f8fafc;
  font-size: 1.1rem;
}

.detalle-evento p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

.selector-turno {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.selector-turno label {
  font-size: 0.85rem;
  color: #facc15;
  font-weight: bold;
}

.selector-turno select {
  background: #1e293b;
  color: #f8fafc;
  border: 1px solid #334155;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.selector-turno select:focus {
  border-color: #facc15;
}

.btn-anular {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid transparent;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}

.btn-anular:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.estado-vacio {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 2rem 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-contenido {
  background: #1e293b;
  color: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  border: 1px solid #334155;
}

.modal-contenido h4 {
  color: #facc15;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.modal-contenido p {
  color: #cbd5e1;
  margin-bottom: 20px;
}

.botones-modal {
  display: flex;
  gap: 10px;
}

.botones-modal button {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.botones-modal .btn-guardar {
  background: #facc15;
  color: #0f172a;
}

.botones-modal .btn-guardar:hover {
  background: #eab308;
}

.botones-modal .btn-cancelar {
  background: #334155;
  color: white;
}

.botones-modal .btn-cancelar:hover {
  background: #475569;
}

/* ESTILOS PARA EL QR */
.qr-contenedor {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
  background: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #334155;
}

.imagen-qr {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.imagen-qr:hover {
  transform: scale(1.05);
}

.descripcion-qr {
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
  margin-bottom: 1rem;
}

.btn-qr {
  width: 100%;
  padding: 10px;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  border: 1px solid #38bdf8;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-qr:hover {
  background: #38bdf8;
  color: #0f172a;
}

:deep(.x-roja-modal) {
  color: #ef4444 !important;
  transition: all 0.2s ease;
}

:deep(.x-roja-modal:hover) {
  color: #dc2626 !important;
  transform: scale(1.2);
}

:deep(.x-roja-modal:focus) {
  box-shadow: none !important;
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {
  .grid-principal {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .cabecera-perfil h1 {
    font-size: 1.8rem;
  }

  .tarjeta {
    padding: 1.3rem;
  }
}

/* =========================================
   📱 MÓVIL — con reordenamiento de secciones
   ========================================= */
@media (max-width: 768px) {
  .perfil {
    padding: 1.5rem 1rem;
  }

  .cabecera-perfil {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .cabecera-perfil h1 {
    font-size: 1.6rem;
  }

  .etiqueta {
    font-size: 0.75rem;
    padding: 5px 12px;
  }

  /* Convertimos el grid en flex para poder usar order entre aside y main */
  .grid-principal {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* display:contents hace que aside y main "desaparezcan" como cajas
     y sus hijos participen directamente en el flex del grid-principal */
  .barra-lateral,
  .contenido {
    display: contents;
  }

  /* Orden deseado: QR → Eventos → Datos → Txandalari → Baja */
  .tarjeta.qr-usuario {
    order: 1;
  }
  .tarjeta.eventos {
    order: 2;
  }
  .tarjeta.datos-usuario {
    order: 3;
  }
  .tarjeta.estado-txandalari {
    order: 4;
  }
  .tarjeta:not(.qr-usuario):not(.eventos):not(.datos-usuario):not(.estado-txandalari) {
    order: 5;
  }

  .tarjeta {
    padding: 1.2rem;
    margin-bottom: 1rem;
  }

  .tarjeta h3 {
    font-size: 1.1rem;
  }

  .dato-texto {
    font-size: 0.95rem;
  }

  .botones-edicion {
    flex-direction: column;
  }

  .botones-edicion button {
    width: 100%;
  }

  .evento-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }

  .fecha-evento {
    flex-direction: row;
    gap: 10px;
    min-width: auto;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {
  .cabecera-perfil h1 {
    font-size: 1.4rem;
  }

  .tarjeta {
    padding: 1rem;
  }

  .grupo-dato label {
    font-size: 0.8rem;
  }

  .dato-texto {
    font-size: 0.9rem;
  }

  .evento-item {
    padding: 0.8rem;
  }

  .fecha-evento {
    padding: 8px;
  }

  .dia {
    font-size: 1.2rem;
  }
}

/* =========================
   📱 QR MODAL CENTRADO
   ========================= */
:deep(.qr-modal-popup) {
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  padding: 1.5rem 1rem !important;
  box-sizing: border-box !important;
}

:deep(.qr-modal-container) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
}

.qr-modal-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-modal-img {
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 300px;
  height: auto;
  background: white;
  padding: 10px;
  border-radius: 10px;
  box-sizing: border-box;
}
</style>