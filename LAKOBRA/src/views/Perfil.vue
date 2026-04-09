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
              <button v-if="!modoEdicion" @click="modoEdicion = true" class="boton-editar-icono"
                title="Editar">✏️</button>
            </div>

            <div v-if="!modoEdicion" class="vista-datos">
              <div class="grupo-dato"><label>{{ $t('perfil.nombre') }}</label>
                <p class="dato-texto">{{ usuarioEditar.nombre }}</p>
              </div>
              <div class="grupo-dato"><label>{{ $t('perfil.dni') }}</label>
                <p class="dato-texto">{{ usuarioEditar.dni }}</p>
              </div>
              <div class="grupo-dato"><label>{{ $t('perfil.email') }}</label>
                <p class="dato-texto">{{ usuarioEditar.email }}</p>
              </div>
              <div class="grupo-dato"><label>{{ $t('perfil.direccion') }}</label>
                <p class="dato-texto">{{ usuarioEditar.direccion }}</p>
              </div>
            </div>

            <div v-else class="formulario-edicion">
              <div class="grupo-dato"><label>{{ $t('perfil.nombre') }}</label><input type="text"
                  v-model="usuarioEditar.nombre" /></div>
              <div class="grupo-dato"><label>{{ $t('perfil.dni') }}</label><input type="text"
                  v-model="usuarioEditar.dni" /></div>
              <div class="grupo-dato"><label>{{ $t('perfil.email') }}</label><input type="email"
                  v-model="usuarioEditar.email" /></div>
              <div class="grupo-dato"><label>{{ $t('perfil.direccion') }}</label><input type="text"
                  v-model="usuarioEditar.direccion" /></div>

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
                  <button @click="abrirConfirmacion = false" class="btn-cancelar">{{ $t('perfil.btn_cancelar')
                    }}</button>
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
                  <p>🕒 {{ evento.hora_inicio.substring(0, 5) }}</p>
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

// Cancelar asistencia
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
      cargarMisEventos()
      Swal.fire({ background: '#1e293b', color: '#f8fafc', icon: 'info', title: 'Cancelado', timer: 1000, showConfirmButton: false })
    }
  } catch (error) { console.error(error) }
}
</script>

<style scoped>
/* ESTILOS ADAPTADOS AL TEMA OSCURO DE LAKOBRA */
.perfil {
  min-height: 100vh;
  /* Hereda el fondo de App.vue, quitamos el blanco/gris */
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
  /* Azul Lakobra */
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

@media (max-width: 768px) {
  .grid-principal {
    grid-template-columns: 1fr;
  }
}

/* TARJETAS PRINCIPALES */
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

/* DATOS USUARIO */
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

/* FORMULARIO EDICIÓN */
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

/* TXANDALARI - ESTILO PREMIUM */
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

.anillo-pulso {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #facc15;
  animation: pulso 2s infinite;
  box-shadow: 0 0 10px #facc15;
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
}

.detalle-evento h4 {
  margin: 0 0 5px 0;
  font-weight: 700;
  color: #f8fafc;
  font-size: 1.1rem;
}

.detalle-evento p {
  margin: 0;
  font-size: 0.9rem;
  color: #94a3b8;
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

/* MODALES DEL PERFIL */
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
</style>