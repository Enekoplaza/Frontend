import { reactive } from 'vue'

export const i18n = reactive({
  idioma: 'es',   
  textos: {}      
})

export async function cargarIdioma(lang) {
  try {
    const res = await fetch(`/locales/${lang}.json`)
    const data = await res.json()
    i18n.textos = data
    i18n.idioma = lang
  } catch (e) {
    console.error('Error cargando idioma:', e)
  }
}