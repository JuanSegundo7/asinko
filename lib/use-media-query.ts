"use client"

import { useEffect, useState } from "react"

/** SSR-safe: el valor inicial se lee en el inicializador perezoso de useState (no en un efecto, evita un render extra), con guarda para cuando `window` no existe. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== "undefined" ? window.matchMedia(query).matches : false))

  useEffect(() => {
    // El valor inicial ya lo resolvió el inicializador perezoso de useState de arriba — acá solo
    // hace falta suscribirse a cambios futuros (breakpoint cruzado), nunca setear de forma
    // síncrona en el cuerpo del efecto (uso de este hook en la app: `query` siempre es un string
    // fijo, no hace falta re-sincronizar si "cambiara").
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}
