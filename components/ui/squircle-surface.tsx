"use client"

import { cn } from "cn"
import { useSquircle } from "@/lib/use-squircle"

const ELEVATION_SHADOW = {
  1: "shadow-[var(--shadow-elevation-1)]",
  2: "shadow-[var(--shadow-elevation-2)]",
  3: "shadow-[var(--shadow-elevation-3)]",
} as const

const ELEVATION_HOVER_SHADOW = {
  1: "hover:shadow-[var(--shadow-elevation-1)]",
  2: "hover:shadow-[var(--shadow-elevation-2)]",
  3: "hover:shadow-[var(--shadow-elevation-3)]",
} as const

type Elevation = 1 | 2 | 3

type SquircleSurfaceProps = {
  as?: "div" | "article" | "section" | "li" | "nav"
  cornerRadius?: number
  cornerSmoothing?: number
  elevation?: Elevation
  hoverElevation?: Elevation
  /** Ancho del "borde" en px. 0 = sin borde (solo fondo + contenido). */
  borderWidth?: number
  /** Clase de color de fondo del borde (la capa de atrás). Default: bg-border. */
  borderColorClassName?: string
  /** Clase de color de fondo del contenido (la capa de adelante). Default: bg-card. */
  backgroundClassName?: string
  className?: string
  outerClassName?: string
  children: React.ReactNode
} & Omit<React.HTMLAttributes<HTMLElement>, "className">

/**
 * D10/D11: squircle real con borde propio dibujado a mano. `clip-path` + `border` de CSS normal
 * rompe las esquinas: el borde se dibuja recto hasta la esquina (con su miter cuadrado) y recién
 * ahí `clip-path` lo recorta con la curva, dejando un bulto en vez de una línea prolija. La
 * técnica correcta es un borde de **dos capas**: una capa de fondo del color del borde recortada
 * al radio completo, y encima una capa del color de fondo real recortada al radio menos el ancho
 * del borde, desplazada hacia adentro ese mismo ancho — el "borde" es el anillo que queda visible
 * entre ambas, curvo en las dos capas desde el vamos, nunca una línea recta cortada después.
 */
export function SquircleSurface({
  as: Outer = "div",
  cornerRadius = 20,
  cornerSmoothing = 0.6,
  elevation,
  hoverElevation,
  borderWidth = 1,
  borderColorClassName = "bg-border",
  backgroundClassName = "bg-card",
  className,
  outerClassName,
  children,
  ...props
}: SquircleSurfaceProps) {
  const { ref: borderRef, clipPath: borderClip } = useSquircle(cornerRadius, cornerSmoothing)
  const { ref: contentRef, clipPath: contentClip } = useSquircle(
    Math.max(cornerRadius - borderWidth, 0),
    cornerSmoothing
  )

  return (
    <Outer
      className={cn(
        elevation && ELEVATION_SHADOW[elevation],
        hoverElevation && ELEVATION_HOVER_SHADOW[hoverElevation],
        "transition-shadow duration-200",
        outerClassName
      )}
      {...props}
      // El box-shadow sigue la geometría real del elemento (border-box + border-radius), no el
      // clip-path de las capas de adentro. Sin este radio acá, la sombra es un rectángulo recto
      // que sobresale en las esquinas más allá de donde termina la curva visible del contenido.
      // No es un squircle real (border-radius normal), pero alcanza para que la sombra no se note
      // cuadrada — nadie percibe la diferencia de curvatura en una sombra difusa. Va después de
      // `...props` a propósito: si algún caller futuro pasa su propio `style`, este radio no se
      // pierde (se combinaría con `props.style` si hiciera falta, hoy ningún caller lo usa).
      style={{ borderRadius: cornerRadius }}
    >
      {/*
        `borderRadius` en las dos capas de adentro, siempre — no solo cuando `clipPath` ya está
        listo. `useSquircle` mide con ResizeObserver: el primer frame no tiene clip-path (ver su
        comentario), así que sin este fallback la esquina se ve recta un frame y recién después
        curva — un parpadeo muy visible en skeletons, que montan y desmontan rápido y en cantidad.
        Con `borderRadius` de base, ese primer frame ya se ve razonablemente curvo (border-radius
        normal, no squircle real) y el cambio a clip-path cuando llega es imperceptible.
      */}
      <div
        ref={borderRef}
        style={{ borderRadius: cornerRadius, ...(borderClip ? { clipPath: borderClip } : {}) }}
        className={cn("h-full", borderWidth > 0 ? borderColorClassName : undefined)}
      >
        <div
          ref={contentRef}
          style={{
            borderRadius: Math.max(cornerRadius - borderWidth, 0),
            margin: borderWidth,
            ...(contentClip ? { clipPath: contentClip } : {}),
          }}
          className={cn("h-full", backgroundClassName, className)}
        >
          {children}
        </div>
      </div>
    </Outer>
  )
}
