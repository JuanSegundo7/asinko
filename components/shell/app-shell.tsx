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
        <div className="flex flex-1 flex-col pb-16 md:pb-0">{children}</div>
        <TabBar />
      </div>
    </div>
  )
}
