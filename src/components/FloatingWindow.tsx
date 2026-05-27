import { type ReactNode, useRef, useState } from "react"
import { X } from "lucide-react"

type Props = {
  title: string
  initialX: number
  initialY: number
  onClose: () => void
  children: ReactNode
}

export function FloatingWindow({ title, initialX, initialY, onClose, children }: Props) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const dragStart = useRef<{ x: number; y: number; left: number; top: number } | null>(null)

  function beginDrag(event: React.PointerEvent<HTMLDivElement>) {
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      left: position.x,
      top: position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function drag(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart.current) return
    const nextX = dragStart.current.left + event.clientX - dragStart.current.x
    const nextY = dragStart.current.top + event.clientY - dragStart.current.y
    setPosition({
      x: Math.max(8, Math.min(window.innerWidth - 280, nextX)),
      y: Math.max(8, Math.min(window.innerHeight - 160, nextY)),
    })
  }

  function endDrag() {
    dragStart.current = null
  }

  return (
    <section className="floating-window" style={{ left: position.x, top: position.y }}>
      <div className="window-titlebar" onPointerDown={beginDrag} onPointerMove={drag} onPointerUp={endDrag}>
        <span>{title}</span>
        <button
          className="window-close"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          title="close"
        >
          <X size={14} />
        </button>
      </div>
      <div className="window-body">{children}</div>
    </section>
  )
}
