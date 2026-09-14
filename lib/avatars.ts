/**
 * D13: fotos reales para los 8 handles únicos que aparecen en todo el seed (autores de posteos +
 * tesis + comentarios) — provistas por el usuario en `public/`, ya no círculos con inicial (eso
 * era la regla de D8 mientras no había con qué; ahora sí hay, y las trajo el propio usuario, no
 * son fotos de stock inventadas por mí). `@demo` y cualquier handle fuera de esta lista siguen
 * cayendo al círculo con inicial en `UserAvatar`.
 */
export const AVATAR_BY_HANDLE: Record<string, string> = {
  "deep.value": "/person1.avif",
  florv: "/person2.jpg",
  macrofede: "/person3.jpg",
  martincode: "/person4.jpg",
  quantcarla: "/person5.jpg",
  renelong: "/person6.png",
  shortandlong: "/person7.jpg",
  valeinversora: "/person8.jpg",
}

export function getAvatarSrc(handle: string): string | null {
  return AVATAR_BY_HANDLE[handle] ?? null
}
