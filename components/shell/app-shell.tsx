import { AppNav } from "./app-nav"
import { TabBar } from "./tab-bar"
import { TopHeader } from "./top-header"

/** D4: shell global — header de página arriba de todo, después nav lateral (desktop/tablet) + tab bar (mobile) alrededor de todas las páginas de /assets. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopHeader />
      <div className="flex flex-1">
        <AppNav />
        {/*
          pb-16 (64px) es la altura "de catálogo" del tab bar, pero éste le suma su propio
          env(safe-area-inset-bottom) (el home indicator del iPhone) — sin sumar lo mismo acá,
          la tab bar termina más alta que el hueco reservado y tapa la última card en dispositivos
          con esa franja.
        */}
        <div className="flex flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </div>
        <TabBar />
      </div>
    </div>
  )
}
