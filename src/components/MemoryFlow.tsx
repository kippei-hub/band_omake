import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type NodeMouseHandler,
  type NodeDragHandler,
  type NodeTypes,
  type ReactFlowInstance,
} from "reactflow"
import { type MouseEvent, useRef } from "react"
import "reactflow/dist/style.css"
import type { AppMode, MemoryNode } from "../types/memory"
import { toFlowEdges, toFlowNodes } from "../utils/flowAdapter"
import { MemoryNode as MemoryNodeComponent } from "./MemoryNode"

const nodeTypes: NodeTypes = {
  memory: MemoryNodeComponent,
}

type Props = {
  nodes: MemoryNode[]
  visibleRouteEdges: ReturnType<typeof toFlowEdges>
  mode: AppMode
  gridVisible: boolean
  onNodeClick: (nodeId: string) => void
  onNodeDoubleClick: (nodeId: string) => void
  onNodeMove: (nodeId: string, x: number, y: number) => void
  onCanvasDoubleClick: (x: number, y: number) => void
}

export function MemoryFlow({
  nodes,
  visibleRouteEdges,
  mode,
  gridVisible,
  onNodeClick,
  onNodeDoubleClick,
  onNodeMove,
  onCanvasDoubleClick,
}: Props) {
  const instanceRef = useRef<ReactFlowInstance | null>(null)
  const flowNodes = toFlowNodes(nodes).map((node) => ({ ...node, draggable: mode === "EDIT" }))

  const handleNodeClick: NodeMouseHandler = (_, node) => onNodeClick(node.id)
  const handleNodeDoubleClick: NodeMouseHandler = (_, node) => onNodeDoubleClick(node.id)
  const handleNodeDragStop: NodeDragHandler = (_, node) => onNodeMove(node.id, node.position.x, node.position.y)

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={visibleRouteEdges}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.25}
      maxZoom={1.7}
      panOnDrag
      zoomOnScroll
      zoomOnDoubleClick={false}
      nodesDraggable={mode === "EDIT"}
      nodesConnectable={false}
      elementsSelectable={false}
      onInit={(reactFlow) => {
        instanceRef.current = reactFlow
      }}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onNodeDragStop={handleNodeDragStop}
      onPaneClick={(event: MouseEvent<Element>) => {
        if (event.detail !== 2) return
        if (mode !== "EDIT" || !instanceRef.current) return
        const point = instanceRef.current.screenToFlowPosition({ x: event.clientX, y: event.clientY })
        onCanvasDoubleClick(point.x, point.y)
      }}
    >
      {gridVisible ? (
        <Background variant={BackgroundVariant.Lines} color="#323232" gap={48} size={1} />
      ) : (
        <Background variant={BackgroundVariant.Dots} color="#2b2b2b" gap={60} size={0.7} />
      )}
      <Controls showInteractive={false} />
    </ReactFlow>
  )
}
