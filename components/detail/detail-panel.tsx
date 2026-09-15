"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion, type AnimationDefinition } from "motion/react"
import { X } from "lucide-react"
import { cn } from "cn"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { useMediaQuery } from "@/lib/use-media-query"

const VARIANTS = {
  initial: { opacity: 0, x: "100%" },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: "100%" },
}

const REDUCED_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * D10: panel de detalle — drawer que flota sobre el contenido (feed + columna derecha quedan
 * intactos detrás). Por debajo de xl (1280px, breakpoint de D4) ocupa toda la pantalla, sin
 * esquinas (nada que "flote" en una pantalla completa); a partir de xl es una card flotante real,
 * separada de los bordes del viewport (`xl:inset-y-3 xl:right-3`), con esquinas squircle — por
 * eso el corner radius se apaga (0) por debajo de xl y se prende (28) recién a partir de ahí.
 *
 * Animación: spring real vía `motion` (no transición CSS) — es la única superficie de esta app
 * con estado abrir/cerrar genuinamente interruptible (D10). El componente maneja su propio ciclo
 * de abrir/cerrar con `open` local en vez de depender de que Next mantenga montada la ruta
 * interceptada durante la salida (se probó con `AnimatePresence` cruzando el límite de la ruta —
 * Next desmonta el segmento antes de que React llegue a animar la salida, así que "✕"/Esc ahora
 * animan primero con `open=false` y recién llaman a `router.back()` en `onAnimationComplete`,
 * cuando el spring realmente terminó. El back nativo del navegador sigue cerrando al instante,
 * sin esta animación — no hay forma de interceptar esa navegación antes de que ya haya ocurrido.
 *
 * Portal a `document.body`: este componente ya se usa anidado en lugares distintos (la ruta
 * interceptada de tesis, pero también dentro de un widget de la columna sticky como
 * TopContributors). `position: fixed` + `z-50` no alcanza si algún ancestro en el medio crea su
 * propio stacking context sin z-index explícito (pasa con `position: sticky`, y también con
 * `clip-path`/`transform`/`filter`) — el header de la app (`z-40`) puede terminar "ganando" e
 * interceptando los clicks del botón "✕", o la sombra puede quedar recortada. Portalear a `body`
 * saca al panel de cualquier ancestro por completo, así el z-50 siempre se compara al nivel raíz.
 *
 * Esquinas vía `SquircleSurface` (no un clip-path de una sola capa a mano): un clip-path solo
 * recorta el fondo, pero no deja ningún borde definido — contra un fondo oscuro y con contenido
 * de la página detrás (glass), el borde del drawer se percibía "raro"/indefinido. SquircleSurface
 * ya resuelve esto con la técnica de doble capa (D10/D11): un anillo de 1px del color del borde,
 * recortado también con su propia curva, así el borde es curvo desde el vamos en vez de una línea
 * recta que el clip-path corta después.
 */
export function DetailPanel({
  children,
  title = "Detail",
  onClose,
  hideHeaderBelowXl = false,
}: {
  children: React.ReactNode
  /** Label del header. Default "Detail" para el uso original (post/tesis). */
  title?: string
  /**
   * Qué hacer cuando termina de animar la salida. Default `router.back()` (el uso original, atado
   * a la ruta interceptada de D2). Un uso NO ruteado (ej. "ver todos los contribuidores" desde
   * TopContributors) pasa su propio `onClose` para simplemente desmontar el drawer.
   */
  onClose?: () => void
  /**
   * El uso original (post/tesis) oculta este header por debajo de xl porque ahí el panel ocupa
   * toda la pantalla y ya tiene su propio "← Ticker" (BackLink) para cerrar. Un uso genérico sin
   * ese BackLink propio (ej. contribuidores) necesita este header SIEMPRE visible — es la única
   * forma de cerrar en mobile/tablet — así que el default es mostrarlo en todos los breakpoints.
   */
  hideHeaderBelowXl?: boolean
}) {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const isXl = useMediaQuery("(min-width: 1280px)")
  // Arranca ya "abierto": motion anima de `initial` a `animate` solo con montar, no hace falta un
  // efecto que lo dispare a mano. `open` acá solo distingue "animate" (abierto) de "exit" (cerrando).
  const [open, setOpen] = useState(true)
  // `document.body` no existe en el render de servidor — portalear recién después de montar en el
  // cliente (un frame de diferencia, imperceptible en un overlay que ya arranca animando su entrada).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function close() {
    setOpen(false)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function handleAnimationComplete(definition: AnimationDefinition) {
    if (definition === "exit") (onClose ?? (() => router.back()))()
  }

  if (!mounted) return null

  return createPortal(
    <motion.div
      variants={reducedMotion ? REDUCED_VARIANTS : VARIANTS}
      initial="initial"
      animate={open ? "animate" : "exit"}
      transition={reducedMotion ? { duration: 0.15 } : { type: "spring", bounce: 0.2, duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
      className="fixed inset-0 z-50 xl:inset-y-3 xl:left-auto xl:right-3 xl:w-[640px] 2xl:w-[720px]"
    >
      {/*
        La sombra vive en el `elevation` de SquircleSurface (no en este motion.div) a propósito:
        el box-shadow sigue el border-radius del elemento que lo tiene, no el clip-path de una capa
        de adentro — si viviera acá (sin border-radius propio), la sombra sería un rectángulo recto
        que sobresale cuadrado en las esquinas más allá de la curva visible real.
      */}
      <SquircleSurface
        cornerRadius={isXl ? 28 : 0}
        elevation={3}
        outerClassName="size-full"
        backgroundClassName="glass-surface-dense"
        className="flex size-full flex-col overflow-y-auto"
      >
        <div
          className={cn(
            "shrink-0 items-center justify-between border-b border-border px-4 py-3",
            hideHeaderBelowXl ? "hidden xl:flex" : "flex"
          )}
        >
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <button
            type="button"
            aria-label="Close panel"
            onClick={close}
            className="press-feedback flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </SquircleSurface>
    </motion.div>,
    document.body
  )
}
