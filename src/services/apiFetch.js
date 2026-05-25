const API_BASE = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
  
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // vital para que funcionen las sesiones PHP
    headers: {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
    },
  })
  
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text}`)
  }
  
  // Como tu API siempre devuelve JSON, lo hacemos aquí directamente
  return res.json()
}