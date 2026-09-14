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
    >
      <div
        ref={borderRef}
        style={borderClip ? { clipPath: borderClip } : undefined}
        className={cn("h-full", borderWidth > 0 ? borderColorClassName : undefined)}
      >
        <div
          ref={contentRef}
          style={{
            ...(contentClip ? { clipPath: contentClip } : undefined),
            margin: borderWidth,
          }}
          className={cn("h-full", backgroundClassName, className)}
        >
          {children}
        </div>
      </div>
    </Outer>
  )
}
