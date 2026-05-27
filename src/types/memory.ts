export type NodeKind = "circle" | "square"

export type MediaAsset = {
  id: string
  kind: "image" | "audio"
  label: string
  src: string
}

export type TextFile = {
  id: string
  filename: string
  content: string
  assets: MediaAsset[]
}

export type BaseMemoryNode = {
  id: string
  kind: NodeKind
  title: string
  x: number
  y: number
}

export type CircleMemoryNode = BaseMemoryNode & {
  kind: "circle"
  file: TextFile
}

export type SquareMemoryNode = BaseMemoryNode & {
  kind: "square"
  directoryName: string
  files: TextFile[]
}

export type MemoryNode = CircleMemoryNode | SquareMemoryNode

export type MemoryRouteEdge = {
  id: string
  source: string
  target: string
}

export type MemoryRoute = {
  id: string
  name: string
  edges: MemoryRouteEdge[]
}

export type MemorySpaceData = {
  nodes: MemoryNode[]
  routes: MemoryRoute[]
}

export type AppMode = "VIEW" | "EDIT"
