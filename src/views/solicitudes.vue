<script setup>
// 1. Importamos la nueva función y quitamos config
import { apiFetch } from '@/services/apiFetch'
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const artistas = ref([])
const txandalaris = ref([])

const swalConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8'
}

const cargarSolicitudes = async () => {
  try {
    // 2. GET súper limpio
    const data = await apiFetch('api_solicitudes.php')
    artistas.value = data.artistas || []
    txandalaris.value = data.txandalaris || []
  } catch (error) {
    console.error('Error cargando solicitudes', error)
  }
}

// 🛠️ Función genérica: Conecta con el PHP
const gestionar = async (id, tipo, metodo, titulo) => {
  try {
    // 3. Petición dinámica limpia
    const data = await apiFetch('api_solicitudes.php', {
      method: metodo,
      body: JSON.stringify({ usuario_id: id, tipo: tipo })
    })
    
    if (data.success) {
      await Swal.fire({ ...swalConfig, icon: 'success', title: titulo, timer: 1500, showConfirmButton: false })
      cargarSolicitudes() 
    }
  } catch (error) {
    console.error(error)
  }
}

// ========================================================
// 🔄 FUNCIONES DE LOS BOTONES
// ========================================================

const aceptarTxandalari = async (id) => {
  const result = await Swal.fire({
    ...swalConfig,
    title: t('solicitudes.swal_aceptar_txan_tit'),
    text: t('solicitudes.swal_aceptar_txan_msg'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: t('solicitudes.swal_si_aceptar'),
    cancelButtonText: t('solicitudes.swal_cancelar')
  })

  if (result.isConfirmed) {
    gestionar(id, 'txandalari', 'POST', t('solicitudes.swal_ok_txan'))
  }
}

const rechazarTxandalari = async (id) => {
  const result = await Swal.fire({
    ...swalConfig,
    title: t('solicitudes.swal_rechazar_tit'),
    text: t('solicitudes.swal_rechazar_txan_msg'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: t('solicitudes.swal_si_rechazar'),
    cancelButtonText: t('solicitudes.swal_cancelar')
  })

  if (result.isConfirmed) {
    gestionar(id, 'txandalari', 'DELETE', t('solicitudes.swal_ok_rechazo'))
  }
}

const aceptarArtista = (id) => gestionar(id, 'artista', 'POST', t('solicitudes.swal_ok_artista_ac'))
const rechazarArtista = (id) => gestionar(id, 'artista', 'DELETE', t('solicitudes.swal_ok_artista_re'))

onMounted(cargarSolicitudes)
</script>

<template>
  <div class="solicitudes-container">

    <div class="header-admin">
      <h1>📩 {{ $t('solicitudes.titulo') }}</h1>
      <p>{{ $t('solicitudes.subtitulo') }}</p>
    </div>

    <section class="admin-seccion">
      <h2>🐍 {{ $t('solicitudes.txan_titulo') }}</h2>
      
      <p v-if="txandalaris.length === 0" class="no-solicitudes">{{ $t('solicitudes.txan_vacio') }}</p>

      <div class="grid-solicitudes">
        <div v-for="t in txandalaris" :key="t.id" class="tarjeta-solicitud">
          <div class="info-solicitud">
            <h3>👤 {{ t.nombre }}</h3>
            <p class="email">✉️ {{ t.email }}</p>
            <p class="dni">🪪 {{ $t('solicitudes.dni') }}: {{ t.dni }}</p>
          </div>
          <div class="estado-acciones">
            <span class="badge pendiente">{{ $t('solicitudes.estado_pendiente') }}</span>
            <div class="botones-admin">
              <button @click="aceptarTxandalari(t.id)" class="btn-aceptar">{{ $t('solicitudes.btn_aceptar') }}</button>
              <button @click="rechazarTxandalari(t.id)" class="btn-rechazar">{{ $t('solicitudes.btn_rechazar') }}</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <hr class="separador">

    <section class="admin-seccion">
      <h2>🎤 {{ $t('solicitudes.artistas_titulo') }}</h2>

      <p v-if="artistas.length === 0" class="no-solicitudes">{{ $t('solicitudes.artistas_vacio') }}</p>

      <div class="grid-solicitudes">
        <div v-for="solicitud in artistas" :key="solicitud.id" class="tarjeta-solicitud" :class="solicitud.estado">
          
          <div class="info-solicitud">
            <h3>🎸 {{ solicitud.nombre_artista }}</h3>
            <p class="email">✉️ {{ solicitud.email_contacto }}</p>
            <p class="fecha">📅 {{ solicitud.fecha_solicitud }}</p>
            <div class="descripcion-box">
              <p>{{ solicitud.descripcion }}</p>
            </div>
          </div>

          <div class="estado-acciones">
            <span :class="['badge', solicitud.estado]">
              {{ solicitud.estado === 'aceptada' ? $t('solicitudes.estado_aceptada') : $t('solicitudes.estado_pendiente') }}
            </span>

            <div class="botones-admin">
              <template v-if="solicitud.estado === 'pendiente'">
                <button @click="aceptarArtista(solicitud.id)" class="btn-aceptar">{{ $t('solicitudes.btn_aceptar') }}</button>
                <button @click="rechazarArtista(solicitud.id)" class="btn-rechazar">{{ $t('solicitudes.btn_rechazar') }}</button>
              </template>

              <template v-else-if="solicitud.estado === 'aceptada'">
                <button class="btn-listo" disabled>
                  ⭐ {{ $t('solicitudes.btn_listo') }}
                </button>
              </template>
            </div>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.solicitudes-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* HEADER */
.header-admin {
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
  padding-bottom: 1rem;
}

.header-admin h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #38bdf8;
  margin-bottom: 0.5rem;
}

.header-admin p {
  color: #94a3b8;
}

/* SECCIÓN */
.admin-seccion h2 {
  font-size: 1.5rem;
  color: var(--titulo);
  margin-bottom: 1.5rem;
}

.no-solicitudes {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

/* GRID */
.grid-solicitudes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 2rem;
}

@media (min-width: 1024px) {
  .grid-solicitudes {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* TARJETAS */
.tarjeta-solicitud {
  background: #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tarjeta-solicitud.aceptada {
  border-color: rgba(250, 204, 21, 0.3);
}

/* INFO */
.info-solicitud h3 {
  color: #f8fafc;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.email,
.fecha,
.dni {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.descripcion-box {
  background: #0f172a;
  padding: 10px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 0.9rem;
  color: #cbd5e1;
  max-height: 100px;
  overflow-y: auto;
}

/* ACCIONES */
.estado-acciones {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.badge {
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.badge.pendiente {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.badge.aceptada {
  background: rgba(250, 204, 21, 0.2);
  color: #facc15;
}

/* BOTONES */
.botones-admin {
  display: flex;
  width: 100%;
  gap: 10px;
}

.botones-admin button {
  flex: 1;
  padding: 10px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.botones-admin button:hover {
  transform: scale(1.05);
}

.btn-aceptar {
  background: #10b981;
  color: white;
}

.btn-rechazar {
  background: #ef4444;
  color: white;
}

.btn-listo {
  background: rgba(250, 204, 21, 0.1) !important;
  color: #facc15 !important;
  border: 1px solid #facc15 !important;
  cursor: default !important;
  width: 100%;
}

.separador {
  border: 0;
  height: 1px;
  background: rgba(148, 163, 184, 0.2);
  margin: 3rem 0;
}

/* =========================================
   📱 TABLET
   ========================================= */
@media (max-width: 1024px) {

  .header-admin h1 {
    font-size: 1.8rem;
  }

  .admin-seccion h2 {
    font-size: 1.4rem;
  }

  .tarjeta-solicitud {
    padding: 1.3rem;
  }
}

/* =========================================
   📱 MÓVIL
   ========================================= */
@media (max-width: 768px) {

  .solicitudes-container {
    padding: 1.5rem 1rem;
  }

  .header-admin h1 {
    font-size: 1.6rem;
  }

  .header-admin p {
    font-size: 0.95rem;
  }

  .grid-solicitudes {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .tarjeta-solicitud {
    padding: 1.2rem;
  }

  .info-solicitud h3 {
    font-size: 1.1rem;
  }

  .email,
  .fecha,
  .dni {
    font-size: 0.85rem;
  }

  .botones-admin {
    flex-direction: column;
  }

  .botones-admin button {
    width: 100%;
  }
}

/* =========================================
   📱 MÓVIL PEQUEÑO
   ========================================= */
@media (max-width: 480px) {

  .solicitudes-container {
    padding: 1rem;
  }

  .header-admin h1 {
    font-size: 1.4rem;
  }

  .tarjeta-solicitud {
    padding: 1rem;
  }

  .descripcion-box {
    font-size: 0.85rem;
  }

  .badge {
    font-size: 0.75rem;
  }
}
</style>