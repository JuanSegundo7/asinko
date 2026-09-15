/**
 * `template.tsx`, no `layout.tsx`: un template remonta en CADA navegación (incluso entre rutas
 * hermanas como /theses -> /theses/t1), a diferencia de un layout que persiste. Es justo lo que
 * hace falta para que la clase `page-in` (app/globals.css) dispare de nuevo en cada página nueva
 * — feed, listado de tesis, detalle completo. El panel interceptado (D2) no pasa por acá: vive en
 * su propio slot `@panel`, ya tiene su propia animación de entrada (motion spring en DetailPanel).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in flex flex-1 flex-col">{children}</div>
}
