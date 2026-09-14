"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { getSvgPath } from "figma-squircle"

/**
 * Squircle real (superellipse continua), no un border-radius grande. figma-squircle necesita el
 * tamaño real en px del elemento para generar el path — se mide con ResizeObserver, así que es
 * válido para cualquier tamaño/breakpoint sin recalcular a mano. Antes de la primera medición no
 * hay clip-path (el elemento se ve como un rect normal por un frame; evita SSR/hidratación rota).
 */
export function useSquircle(cornerRadius: number, cornerSmoothing = 0.6) {
  const ref = useRef<HTMLDivElement>(null)
  const [clipPath, setClipPath] = useState<string>()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      const path = getSvgPath({ width, height, cornerRadius, cornerSmoothing })
      setClipPath(`path('${path}')`)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cornerRadius, cornerSmoothing])

  return { ref, clipPath }
}
