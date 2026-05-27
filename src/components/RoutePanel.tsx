import type { AppMode, MemoryRoute } from "../types/memory"

type Props = {
  open: boolean
  mode: AppMode
  routes: MemoryRoute[]
  selectedRouteId?: string
  connecting: boolean
  onToggle: () => void
  onSelect: (routeId: string) => void
  onCreate: () => void
  onDelete: (routeId: string) => void
  onConnect: () => void
  onRename: (routeId: string, name: string) => void
}

export function RoutePanel({
  open,
  mode,
  routes,
  selectedRouteId,
  connecting,
  onToggle,
  onSelect,
  onCreate,
  onDelete,
  onConnect,
  onRename,
}: Props) {
  return (
    <>
      <button className="panel route-toggle" onClick={onToggle}>
        ROUTES
      </button>
      <aside className={open ? "route-panel open" : "route-panel"}>
        <div className="route-header">
          <span>memory routes</span>
          <button
            className={connecting ? "control-button active" : "control-button"}
            disabled={!selectedRouteId || mode !== "EDIT"}
            onClick={onConnect}
          >
            Connect
          </button>
        </div>
        <div className="route-list" onDoubleClick={(event) => event.currentTarget === event.target && mode === "EDIT" && onCreate()}>
          {routes.map((route) => (
            <div
              key={route.id}
              className={selectedRouteId === route.id ? "route-row active" : "route-row"}
              onClick={() => onSelect(route.id)}
              onDoubleClick={() => mode === "EDIT" && onDelete(route.id)}
            >
              <button
                className={selectedRouteId === route.id ? "route-check active" : "route-check"}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect(route.id)
                }}
                title="select route"
              />
              <input
                value={route.name}
                disabled={mode !== "EDIT"}
                onChange={(event) => onRename(route.id, event.target.value)}
                onClick={() => onSelect(route.id)}
                onFocus={() => onSelect(route.id)}
              />
              <span>{route.edges.length}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
