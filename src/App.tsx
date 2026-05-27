import { useEffect, useMemo, useRef, useState } from "react"
import type { AppMode, MemoryNode, MemoryRoute, MemorySpaceData, NodeKind, SquareMemoryNode, TextFile } from "./types/memory"
import {
  downloadMemory,
  loadBundledMemory,
  loadDeveloperMemory,
  loadViewerMemory,
  persistMemory,
  persistViewerMemory,
  readMemoryFile,
} from "./utils/storage"
import { generateId } from "./utils/id"
import { normalizeEdge, toFlowEdges } from "./utils/flowAdapter"
import { MemoryFlow } from "./components/MemoryFlow"
import { ModeToggle } from "./components/ModeToggle"
import { NodeKindSelector } from "./components/NodeKindSelector"
import { CircleTextWindow } from "./components/CircleTextWindow"
import { SquareDirectoryWindow } from "./components/SquareDirectoryWindow"
import { RoutePanel } from "./components/RoutePanel"
import { PasswordGate } from "./components/PasswordGate"

function createNode(kind: NodeKind, x: number, y: number): MemoryNode {
  const id = generateId("node")
  if (kind === "circle") {
    return {
      id,
      kind,
      title: "untitled fragment",
      x,
      y,
      file: { id: generateId("file"), filename: "untitled.txt", content: "", assets: [] },
    }
  }
  return {
    id,
    kind,
    title: "untitled_directory",
    x,
    y,
    directoryName: "untitled_directory",
    files: [],
  }
}

function routeWithToggledEdge(route: MemoryRoute, source: string, target: string): MemoryRoute {
  const key = normalizeEdge(source, target)
  const exists = route.edges.some((edge) => normalizeEdge(edge.source, edge.target) === key)
  if (exists) {
    return { ...route, edges: route.edges.filter((edge) => normalizeEdge(edge.source, edge.target) !== key) }
  }
  return {
    ...route,
    edges: [...route.edges, { id: generateId("edge"), source, target }],
  }
}

export default function App() {
  const isDeveloperRoute = window.location.pathname === "/develop"
  const needsPassword = !isDeveloperRoute
  const [data, setData] = useState<MemorySpaceData>(() => (isDeveloperRoute ? loadDeveloperMemory() : loadBundledMemory()))
  const [unlocked, setUnlocked] = useState(() => !needsPassword || sessionStorage.getItem("memory-space-unlocked") === "true")
  const [mode, setMode] = useState<AppMode>("VIEW")
  const [nodeKind, setNodeKind] = useState<NodeKind>("circle")
  const [textWindow, setTextWindow] = useState<
    | { source: "circle"; nodeId: string }
    | { source: "square"; nodeId: string; fileId: string }
    | undefined
  >()
  const [squareWindowId, setSquareWindowId] = useState<string>()
  const [routePanelOpen, setRoutePanelOpen] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string>()
  const [connecting, setConnecting] = useState(false)
  const [connectSource, setConnectSource] = useState<string>()
  const [gridVisible, setGridVisible] = useState(false)
  const loadInputRef = useRef<HTMLInputElement>(null)
  const effectiveMode: AppMode = isDeveloperRoute ? mode : "VIEW"

  useEffect(() => {
    if (isDeveloperRoute) return
    let active = true
    loadViewerMemory().then((initialData) => {
      if (active) setData(initialData)
    })
    return () => {
      active = false
    }
  }, [isDeveloperRoute])

  useEffect(() => {
    if (isDeveloperRoute) {
      persistMemory(data)
    } else {
      persistViewerMemory(data)
    }
  }, [data, isDeveloperRoute])

  const selectedRoute = data.routes.find((route) => route.id === selectedRouteId)
  const visibleRouteEdges = useMemo(() => toFlowEdges(selectedRoute), [selectedRoute])
  const squareNode = data.nodes.find((node): node is SquareMemoryNode => node.id === squareWindowId && node.kind === "square")
  const textWindowFile = useMemo(() => {
    if (!textWindow) return undefined
    const node = data.nodes.find((item) => item.id === textWindow.nodeId)
    if (!node) return undefined
    if (textWindow.source === "circle" && node.kind === "circle") {
      return { title: node.title, file: node.file }
    }
    if (textWindow.source === "square" && node.kind === "square") {
      const file = node.files.find((item) => item.id === textWindow.fileId)
      return file ? { title: file.filename, file } : undefined
    }
    return undefined
  }, [data.nodes, textWindow])

  function updateNode(nextNode: MemoryNode) {
    setData((current) => ({
      ...current,
      nodes: current.nodes.map((node) => (node.id === nextNode.id ? nextNode : node)),
    }))
  }

  function deleteNode(nodeId: string) {
    setData((current) => ({
      nodes: current.nodes.filter((node) => node.id !== nodeId),
      routes: current.routes.map((route) => ({
        ...route,
        edges: route.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      })),
    }))
    if (textWindow?.nodeId === nodeId) setTextWindow(undefined)
    if (squareWindowId === nodeId) setSquareWindowId(undefined)
  }

  function updateTextFile(nextFile: TextFile) {
    if (!textWindow) return
    setData((current) => ({
      ...current,
      nodes: current.nodes.map((node) => {
        if (node.id !== textWindow.nodeId) return node
        if (textWindow.source === "circle" && node.kind === "circle") {
          return { ...node, file: nextFile, title: nextFile.filename || node.title }
        }
        if (textWindow.source === "square" && node.kind === "square") {
          return {
            ...node,
            files: node.files.map((file) => (file.id === textWindow.fileId ? nextFile : file)),
          }
        }
        return node
      }),
    }))
  }

  function handleNodeClick(nodeId: string) {
    if (connecting && selectedRouteId) {
      if (!connectSource) {
        setConnectSource(nodeId)
        return
      }
      if (connectSource !== nodeId) {
        setData((current) => ({
          ...current,
          routes: current.routes.map((route) =>
            route.id === selectedRouteId ? routeWithToggledEdge(route, connectSource, nodeId) : route,
          ),
        }))
      }
      setConnecting(false)
      setConnectSource(undefined)
      return
    }

    const node = data.nodes.find((item) => item.id === nodeId)
    if (!node) return
    if (node.kind === "circle") setTextWindow({ source: "circle", nodeId })
    if (node.kind === "square") setSquareWindowId(nodeId)
  }

  function handleNodeDoubleClick(nodeId: string) {
    if (effectiveMode === "EDIT") deleteNode(nodeId)
  }

  async function handleLoad(file?: File) {
    if (!file) return
    try {
      const loaded = await readMemoryFile(file)
      setData(loaded)
      setSelectedRouteId(undefined)
      setTextWindow(undefined)
      setSquareWindowId(undefined)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to load JSON")
    }
  }

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <main className="app-shell">
      <MemoryFlow
        nodes={data.nodes}
        visibleRouteEdges={visibleRouteEdges}
        mode={effectiveMode}
        gridVisible={gridVisible}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeMove={(nodeId, x, y) =>
          setData((current) => ({
            ...current,
            nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, x, y } : node)),
          }))
        }
        onCanvasDoubleClick={(x, y) => setData((current) => ({ ...current, nodes: [...current.nodes, createNode(nodeKind, x, y)] }))}
      />

      <div className="top-left">
        {isDeveloperRoute && <ModeToggle mode={mode} onChange={setMode} />}
        <span className="mode-readout">{connecting ? "CONNECT" : effectiveMode}</span>
      </div>

      <div className="top-actions">
        <button
          className={gridVisible ? "panel action-button active" : "panel action-button"}
          onClick={() => setGridVisible((visible) => !visible)}
        >
          GRID
        </button>
        {isDeveloperRoute && (
          <>
            <button className="panel action-button" onClick={() => downloadMemory(data)}>
              SAVE
            </button>
            <button className="panel action-button" onClick={() => loadInputRef.current?.click()}>
              LOAD
            </button>
            <input
              ref={loadInputRef}
              className="hidden-file"
              type="file"
              accept="application/json,.json"
              onChange={(event) => handleLoad(event.target.files?.[0])}
            />
          </>
        )}
      </div>

      {effectiveMode === "EDIT" && <NodeKindSelector value={nodeKind} onChange={setNodeKind} />}

      <RoutePanel
        open={routePanelOpen}
        mode={effectiveMode}
        routes={data.routes}
        selectedRouteId={selectedRouteId}
        connecting={connecting}
        onToggle={() => setRoutePanelOpen((open) => !open)}
        onSelect={(routeId) => setSelectedRouteId(routeId)}
        onCreate={() =>
          setData((current) => ({
            ...current,
            routes: [...current.routes, { id: generateId("route"), name: "untitled_route", edges: [] }],
          }))
        }
        onDelete={(routeId) => {
          setData((current) => ({ ...current, routes: current.routes.filter((route) => route.id !== routeId) }))
          if (selectedRouteId === routeId) setSelectedRouteId(undefined)
          if (selectedRouteId === routeId) {
            setConnecting(false)
            setConnectSource(undefined)
          }
        }}
        onConnect={() => {
          if (!selectedRouteId) return
          setConnecting((current) => !current)
          setConnectSource(undefined)
        }}
        onRename={(routeId, name) =>
          setData((current) => ({
            ...current,
            routes: current.routes.map((route) => (route.id === routeId ? { ...route, name } : route)),
          }))
        }
      />

      {textWindowFile && (
        <CircleTextWindow
          title={textWindowFile.title}
          file={textWindowFile.file}
          canManageAssets={isDeveloperRoute}
          onCommit={updateTextFile}
          onClose={() => setTextWindow(undefined)}
        />
      )}
      {squareNode && (
        <SquareDirectoryWindow
          node={squareNode}
          editMode={effectiveMode === "EDIT"}
          onCommit={updateNode}
          onClose={() => setSquareWindowId(undefined)}
          onOpenFile={(fileId) => setTextWindow({ source: "square", nodeId: squareNode.id, fileId })}
          onRemoveOpenFile={(fileId) => {
            if (textWindow?.source === "square" && textWindow.nodeId === squareNode.id && textWindow.fileId === fileId) {
              setTextWindow(undefined)
            }
          }}
        />
      )}
    </main>
  )
}
