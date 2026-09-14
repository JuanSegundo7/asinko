"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion, type AnimationDefinition } from "motion/react"
import { X } from "lucide-react"
import { useSquircle } from "@/lib/use-squircle"
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
 */
export function DetailPanel({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const isXl = useMediaQuery("(min-width: 1280px)")
  const { ref: squircleRef, clipPath } = useSquircle(isXl ? 28 : 0)
  // Arranca ya "abierto": motion anima de `initial` a `animate` solo con montar, no hace falta un
  // efecto que lo dispare a mano. `open` acá solo distingue "animate" (abierto) de "exit" (cerrando).
  const [open, setOpen] = useState(true)

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
    if (definition === "exit") router.back()
  }

  return (
    <motion.div
      variants={reducedMotion ? REDUCED_VARIANTS : VARIANTS}
      initial="initial"
      animate={open ? "animate" : "exit"}
      transition={reducedMotion ? { duration: 0.15 } : { type: "spring", bounce: 0.2, duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
      className="fixed inset-0 z-50 xl:inset-y-3 xl:left-auto xl:right-3 xl:w-[640px] xl:shadow-[var(--shadow-elevation-3)] 2xl:w-[720px]"
    >
      <div
        ref={squircleRef}
        style={clipPath ? { clipPath } : undefined}
        className="glass-surface-dense flex size-full flex-col overflow-y-auto"
      >
        <div className="hidden shrink-0 items-center justify-between border-b border-border px-4 py-3 xl:flex">
          <span className="text-sm font-medium text-muted-foreground">Detalle</span>
          <button
            type="button"
            aria-label="Cerrar panel"
            onClick={close}
            className="press-feedback flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </motion.div>
  )
}
