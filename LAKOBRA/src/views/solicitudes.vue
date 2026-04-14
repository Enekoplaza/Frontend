<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { API_URL } from '../config'

const artistas = ref([])
const txandalaris = ref([])

const swalConfig = {
  background: '#1e293b',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8'
}

const cargarSolicitudes = async () => {
  try {
    const res = await fetch(`${API_URL}/api_solicitudes.php`, { credentials: 'include' })
    const data = await res.json()
    console.log("Datos recibidos:", data)
    artistas.value = data.artistas || []
    txandalaris.value = data.txandalaris || []
  } catch (error) {
    console.error('Error cargando solicitudes', error)
  }
}

// 🛠️ Función genérica: Conecta con el PHP
const gestionar = async (id, tipo, metodo, titulo) => {
  try {
    const res = await fetch(`${API_URL}/api_solicitudes.php`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        usuario_id: id, 
        tipo: tipo 
      })
    })
    const data = await res.json()
    if (data.success) {
      await Swal.fire({ ...swalConfig, icon: 'success', title: titulo })
      cargarSolicitudes() 
    }
  } catch (error) {
    console.error(error)
  }
}

// ========================================================
// 🔄 FUNCIONES DE LOS BOTONES (Con confirmación de seguridad)
// ========================================================

const aceptarTxandalari = async (id) => {
  const result = await Swal.fire({
    ...swalConfig,
    title: '¿Aceptar nuevo Txandalari?',
    text: "El socio pasará a tener el rol de Txandalari automáticamente.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aceptar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    gestionar(id, 'txandalari', 'POST', '¡Hecho! Ahora es Txandalari.')
  }
}

const rechazarTxandalari = async (id) => {
  const result = await Swal.fire({
    ...swalConfig,
    title: '¿Rechazar solicitud?',
    text: "La solicitud se quitará pero el usuario seguirá siendo socio.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Sí, rechazar'
  })

  if (result.isConfirmed) {
    gestionar(id, 'txandalari', 'DELETE', 'Solicitud rechazada')
  }
}

const aceptarArtista = (id) => gestionar(id, 'artista', 'POST', 'Artista aceptado')
const rechazarArtista = (id) => gestionar(id, 'artista', 'DELETE', 'Artista rechazado')

onMounted(cargarSolicitudes)
</script>
<template>
  <div class="solicitudes">

    <h1>📩 Solicitudes</h1>

    <!-- ================= ARTISTAS ================= -->
    <section>
      <h2>🎤 Artistas</h2>

      <div v-if="artistas.length === 0">
        No hay solicitudes de artistas
      </div>

      <div v-for="a in artistas" :key="a.id" class="card">
        <p><strong>{{ a.nombre }}</strong></p>
        <p>{{ a.email }}</p>

        <button @click="aceptarArtista(a.id)">Aceptar</button>
        <button @click="rechazarArtista(a.id)">Rechazar</button>
      </div>
    </section>

    <hr>

    <!-- ================= TXANDALARI ================= -->
    <section>
      <h2>🐍 Txandalaris</h2>

      <div v-if="txandalaris.length === 0">
        No hay solicitudes de txandalari
      </div>

      <div v-for="t in txandalaris" :key="t.id" class="card">
        <p><strong>{{ t.nombre }}</strong></p>
        <p>{{ t.email }}</p>

        <button @click="aceptarTxandalari(t.id)">Aceptar</button>
        <button @click="rechazarTxandalari(t.id)">Rechazar</button>
      </div>
    </section>

  </div>
</template>

<style scoped>
.solicitudes {
  padding: 20px;
}

.card {
  background: #0f172a;
  color: white;
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>