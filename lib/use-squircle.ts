"use client"

import { useCallback, useLayoutEffect, useState } from "react"
import { getSvgPath } from "figma-squircle"

/**
 * Squircle real (superellipse continua), no un border-radius grande. figma-squircle necesita el
 * tamaño real en px del elemento para generar el path — se mide con ResizeObserver, así que es
 * válido para cualquier tamaño/breakpoint sin recalcular a mano. Antes de la primera medición no
 * hay clip-path (el elemento se ve como un rect normal por un frame; evita SSR/hidratación rota).
 *
 * `ref` es un callback ref (no `useRef` + leer `.current` en el efecto): algunos consumidores
 * (ej. DetailPanel, portaleado a `document.body` recién en un segundo render, después de
 * confirmar que está en el cliente) montan el nodo real más tarde que el primer render. Con
 * `useRef`, el efecto de medición depende de `[cornerRadius, cornerSmoothing]` — si esos valores
 * no cambian entre el render "sin nodo" y el render "con nodo", el efecto nunca se vuelve a
 * disparar y el clip-path queda en `undefined` para siempre. El callback ref guarda el nodo en
 * estado, así que su cambio (`null` → elemento real) SÍ dispara una nueva medición.
 */
export function useSquircle(cornerRadius: number, cornerSmoothing = 0.6) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const [clipPath, setClipPath] = useState<string>()
  const ref = useCallback((node: HTMLDivElement | null) => setEl(node), [])

  useLayoutEffect(() => {
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
  }, [el, cornerRadius, cornerSmoothing])

  return { ref, clipPath }
}
