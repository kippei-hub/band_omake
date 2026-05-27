import type { Edge, Node } from "reactflow"
import type { MemoryNode, MemoryRoute } from "../types/memory"

export type MemoryFlowNodeData = {
  node: MemoryNode
}

export function toFlowNodes(nodes: MemoryNode[]): Node<MemoryFlowNodeData>[] {
  return nodes.map((node) => ({
    id: node.id,
    type: "memory",
    position: { x: node.x, y: node.y },
    data: { node },
    draggable: true,
  }))
}

export function toFlowEdges(route?: MemoryRoute): Edge[] {
  if (!route) return []
  return route.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "default",
    animated: false,
    style: { stroke: "#9a9a9a", strokeWidth: 1.15 },
  }))
}

export function normalizeEdge(source: string, target: string) {
  return [source, target].sort().join("__")
}
