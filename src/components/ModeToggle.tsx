import type { AppMode } from "../types/memory"

type Props = {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="panel control-row">
      {(["VIEW", "EDIT"] as const).map((item) => (
        <button
          key={item}
          className={mode === item ? "control-button active" : "control-button"}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
