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
          <section class="tarjeta datos-usuario">
            <div class="cabecera-seccion">
              <h3><i class="icono">👤</i> {{ $t('perfil.mis_datos') }}</h3>
              <button v-if="!modoEdicion" @click="modoEdicion = true" class="boton-editar-icono">✏️</button>
            </div>

            <div v-if="!modoEdicion" class="vista-datos">
              <div class="grupo-dato"><label>{{ $t('perfil.nombre') }}</label><p class="dato-texto">{{ usuarioEditar.nombre }}</p></div>
              <div class="grupo-dato"><label>{{ $t('perfil.dni') }}</label><p class="dato-texto">{{ usuarioEditar.dni }}</p></div>
              <div class="grupo-dato"><label>{{ $t('perfil.email') }}</label><p class="dato-texto">{{ usuarioEditar.email }}</p></div>
              <div class="grupo-dato"><label>{{ $t('perfil.direccion') }}</label><p class="dato-texto">{{ usuarioEditar.direccion }}</p></div>
            </div>

            <div v-else class="formulario-edicion">
              <div class="grupo-dato"><label>{{ $t('perfil.nombre') }}</label><input type="text" v-model="usuarioEditar.nombre" /></div>
              <div class="grupo-dato"><label>{{ $t('perfil.dni') }}</label><input type="text" v-model="usuarioEditar.dni" /></div>
              <div class="grupo-dato"><label>{{ $t('perfil.email') }}</label><input type="email" v-model="usuarioEditar.email" /></div>
              <div class="grupo-dato"><label>{{ $t('perfil.direccion') }}</label><input type="text" v-model="usuarioEditar.direccion" /></div>

              <div class="botones-edicion">
                <button @click="guardarCambios" class="btn-guardar">{{ $t('perfil.btn_guardar') }}</button>
                <button @click="cancelarEdicion" class="btn-cancelar">{{ $t('perfil.btn_cancelar') }}</button>
              </div>
            </div>
          </section>

          <section class="tarjeta estado-txandalari" :class="{ activo: usuarioEditar.solicitud_txandalari == 1 }">
            <h3>🐍 {{ $t('perfil.estado_lakobra') }}</h3>

            <div v-if="usuarioEditar.solicitud_txandalari == 1" class="estado-activo">
              <div class="anillo-pulso"></div>
              <div class="texto-estado">
                <span class="estado-principal">{{ $t('perfil.txan_oficial') }}</span>
                <span class="estado-secundario">{{ $t('perfil.txan_elite') }}</span>
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
                  <button @click="confirmarSolicitud" class="btn-guardar">{{ $t('perfil.btn_si_enviar') }}</button>
                  <button @click="abrirConfirmacion = false" class="btn-cancelar">{{ $t('perfil.btn_cancelar') }}</button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <main class="contenido">
          <section class="tarjeta eventos">
            <h3><i class="icono">📅</i> {{ $t('perfil.mis_eventos') }}</h3>

            <div v-if="misEventos.length > 0" class="lista-eventos">
              <div v-for="evento in misEventos" :key="evento.id" class="evento-item">
                <div class="fecha-evento">
                  <span class="dia">{{ evento.fecha_evento.split('-')[2] }}</span>
                  <span class="mes">{{ evento.fecha_evento.split('-')[1] }}</span>
                </div>
                <div class="detalle-evento">
                  <h4>{{ evento.titulo }}</h4>
                  <p>🕒 {{ evento.hora_inicio.substring(0,5) }}</p>
                </div>
                <button @click="cancelarAsistencia(evento.id)" class="btn-anular" title="Anular asistencia">×</button>
              </div>
            </div>

            <div v-else class="estado-vacio">
              <p>{{ $t('perfil.no_eventos') }}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'

const { t } = useI18n()

const props = defineProps({
  usuario: { type: Object, required: true },
})
const emit = defineEmits(['actualizar-usuario'])

const cargando = ref(false)
const modoEdicion = ref(false)
const abrirConfirmacion = ref(false)
const usuarioEditar = ref({})
const misEventos = ref([])

// Sincronizar datos del usuario
watch(
  () => props.usuario,
  (nuevoUsuario) => {
    if (nuevoUsuario) usuarioEditar.value = { ...nuevoUsuario }
  },
  { immediate: true, deep: true }
)

// Cargar mis eventos al entrar
const cargarMisEventos = async () => {
  try {
    const res = await fetch('http://localhost/Backend/api_perfil.php', { credentials: 'include' })
    const data = await res.json()
    if (data.success) misEventos.value = data.eventos
  } catch (error) { console.error("Error eventos:", error) }
}

onMounted(cargarMisEventos)

// Guardar datos
const cancelarEdicion = () => {
  usuarioEditar.value = { ...props.usuario }
  modoEdicion.value = false
}

const guardarCambios = async () => {
  try {
    const res = await fetch('http://localhost/Backend/api_perfil.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(usuarioEditar.value)
    })
    const data = await res.json()
    
    if (data.success) {
      // Emitimos al App.vue para que recargue la sesión
      emit('actualizar-usuario', usuarioEditar.value)
      modoEdicion.value = false
      Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'success', title: t('perfil.msg_datos_ok'), timer: 1500, showConfirmButton: false })
    }
  } catch (error) {
    console.error(error)
  }
}

// Solicitar Txandalari
const confirmarSolicitud = async () => {
  abrirConfirmacion.value = false
  cargando.value = true
  try {
    const res = await fetch('http://localhost/Backend/api_perfil.php', { method: 'PATCH', credentials: 'include' })
    const data = await res.json()
    
    if (data.success) {
      usuarioEditar.value.solicitud_txandalari = 1
      emit('actualizar-usuario', usuarioEditar.value)
      Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'success', title: '¡Solicitud enviada!' })
    } else {
      Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'error', title: t('perfil.msg_err_enviar') })
    }
  } catch (error) {
    Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'error', title: t('perfil.msg_err_conexion') })
  } finally {
    cargando.value = false
  }
}

// Cancelar asistencia a un evento desde el perfil
const cancelarAsistencia = async (id_evento) => {
  try {
    const res = await fetch('http://localhost/Backend/api_asistir.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_evento })
    })
    const data = await res.json()
    if (data.success) {
      cargarMisEventos() // Recargamos la lista
      Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'info', title: 'Cancelado', timer: 1000, showConfirmButton: false })
    }
  } catch (error) { console.error(error) }
}
</script>

<style scoped>
:root {
  --color-fondo: #f1f5f9;
  --color-primario: #3b82f6;
  --color-secundario: #111827;
  --color-claro: #fff;
  --color-muted: #64748b;
  --color-activo: #facc15;
  --border-raduis: 16px;
  --sombra: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.perfil {
  min-height: 100vh;
  background-color: var(--color-fondo);
  font-family: 'Inter', sans-serif;
  color: var(--color-secundario);
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
}

.cabecera-perfil h1 {
  font-size: 2rem;
  font-weight: 800;
}

.cabecera-perfil h1 span {
  color: var(--color-claro);
  padding: 2px 10px;
  border-radius: var(--border-raduis);
}

.etiqueta {
  padding: 6px 16px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 0.75rem;
  background: var(--color-claro);
  border: 1px solid #e2e8f0;
}

.etiqueta.admin {
  background: #fee2e2;
  color: #dc2626;
}

.grid-principal {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .grid-principal {
    grid-template-columns: 1fr;
  }
}

.tarjeta {
  background: var(--color-claro);
  border-radius: var(--border-raduis);
  padding: 1.5rem;
  box-shadow: var(--sombra);
  margin-bottom: 1.5rem;
}

.tarjeta h3 {
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grupo-dato {
  margin-bottom: 1rem;
}

.grupo-dato label {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-weight: 600;
  display: block;
}

.grupo-dato p,
.grupo-dato input {
  font-weight: 500;
  padding: 4px 6px;
  border-radius: var(--radio-bordes);
  border: 1px solid #d1d5db;
  margin-top: 3px;
  width: 100%;
}

.botones-edicion {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-guardar {
  background: var(--color-primario);
  color: var(--color-claro);
  padding: 8px 12px;
  border: none;
  border-radius: var(--radio-bordes);
  cursor: pointer;
}

.btn-cancelar {
  background: rgb(126, 126, 219);
  color: var(--color-secundario);
  padding: 8px 12px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
}

.boton-editar {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primario);
  margin-left: 10px;
  font-size: 0.8rem;
}

/* TXANDALARI */
.estado-txandalari {
  background: #000;
  color: var(--color-claro);
  padding: 1rem;
  border-radius: var(--radio-bordes);
}

.estado-txandalari.activo {
  border: 2px solid var(--color-activo);
}

.estado-activo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.estado-principal {
  font-weight: 800;
  color: var(--color-activo);
}

.estado-secundario {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.anillo-pulso {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-activo);
  animation: pulso 2s infinite;
}

@keyframes pulso {

  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }

  50% {
    transform: scale(1);
    opacity: 0;
  }
}

/* BOTON TXANDALARI */
.btn-txandalari {
  position: relative;
  width: 100%;
  padding: 12px;
  background: rgb(125, 125, 236);
  color: rgb(2, 60, 87);
  border: none;
  border-radius: 16px;
  font-weight: 800;
  cursor: pointer;
  overflow: hidden;
}

.btn-txandalari:disabled {
  background: #ad8989;
  color: #723030;
  cursor: not-allowed;
}

.btn-txandalari:hover .efecto-brillante {
  left: 200%;
  transition: 0.8s ease;
}

/* EVENTOS */
.evento-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: var(--radio-bordes);
  margin-bottom: 1rem;
}

.fecha-evento {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-activo);
  color: black;
  padding: 6px;
  border-radius: var(--radio-bordes);
  min-width: 50px;
}

.dia {
  font-weight: 800;
  font-size: 1.2rem;
}

.mes {
  font-size: 0.7rem;
  font-weight: 700;
}

.detalle-evento h4 {
  margin: 0;
  font-weight: 700;
}

.detalle-evento p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-muted);
}

.btn-anular {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-anular:hover {
  color: #ef4444;
}
</style>