import { Circle, Square } from "lucide-react"
import type { NodeKind } from "../types/memory"

type Props = {
  value: NodeKind
  onChange: (kind: NodeKind) => void
}

export function NodeKindSelector({ value, onChange }: Props) {
  return (
    <div className="panel node-kind">
      <button
        className={value === "circle" ? "icon-button active" : "icon-button"}
        onClick={() => onChange("circle")}
        title="circle"
      >
        <Circle size={16} />
      </button>
      <button
        className={value === "square" ? "icon-button active" : "icon-button"}
        onClick={() => onChange("square")}
        title="square"
      >
        <Square size={16} />
      </button>
    </div>
  )
}
