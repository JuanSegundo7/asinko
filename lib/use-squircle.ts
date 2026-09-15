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

    // El tamaño se toma del propio ResizeObserver (`entry`), NO de un `getBoundingClientRect()`
    // dentro del callback. Motivo: el elemento clippeado es `h-full` de su padre y su altura la
    // define el contenido — leer `getBoundingClientRect()` acá puede devolver el tamaño de un
    // frame anterior (antes de que el layout del nuevo contenido se asiente), dejando el clip-path
    // calculado para un tamaño viejo. El resultado observado en mobile: un clip mucho más ancho o
    // alto que la card real (el clip quedó "pegado" a una medición previa), cortando el contenido
    // por dentro del fondo. `entry.contentRect`/`borderBoxSize` es el tamaño real de ESTE resize.
    const apply = (width: number, height: number) => {
      if (!width || !height) return
      const value = `path('${getSvgPath({ width, height, cornerRadius, cornerSmoothing })}')`
      // Se escribe imperativamente (aplica en el mismo frame que el resize, antes del paint —
      // sin el desfase de un render de React) y además al estado (para que sobreviva a un
      // re-render que reescribiría el `style` inline desde las props del componente).
      el.style.clipPath = value
      setClipPath(value)
    }

    const ro = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      const box = entry.borderBoxSize?.[0]
      if (box) {
        apply(box.inlineSize, box.blockSize)
      } else {
        const r = entry.contentRect
        apply(r.width, r.height)
      }
    })
    ro.observe(el)

    // Medición inicial sincrónica (el primer callback del RO llega un tick después; sin esto habría
    // un frame sin clip). Acá sí `getBoundingClientRect` es correcto: es el tamaño ya asentado del
    // montaje inicial, no un resize en vuelo.
    const rect = el.getBoundingClientRect()
    apply(rect.width, rect.height)

    return () => ro.disconnect()
  }, [el, cornerRadius, cornerSmoothing])

  return { ref, clipPath }
}
