import { memo, useEffect, useMemo, useState } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import type { MemoryFlowNodeData } from "../utils/flowAdapter"

function firstLine(value: string) {
  return value.split(/\r?\n/)[0] ?? ""
}

function MemoryNodeComponent({ data }: NodeProps<MemoryFlowNodeData>) {
  const [hovered, setHovered] = useState(false)
  const [typed, setTyped] = useState("")
  const preview = useMemo(() => {
    const node = data.node
    if (node.kind === "circle") return firstLine(node.file.content)
    return node.files[0] ? firstLine(node.files[0].content) : ""
  }, [data.node])

  useEffect(() => {
    if (!hovered || !preview) {
      setTyped("")
      return
    }

    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTyped(preview.slice(0, index))
      if (index >= preview.length) window.clearInterval(timer)
    }, 58)

    return () => window.clearInterval(timer)
  }, [hovered, preview])

  return (
    <div
      className="memory-node-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="hidden-handle" />
      <div className={`memory-node ${data.node.kind}`} />
      <Handle type="source" position={Position.Bottom} className="hidden-handle" />
      {typed && <div className="node-preview">{typed}</div>}
    </div>
  )
}

export const MemoryNode = memo(MemoryNodeComponent)
