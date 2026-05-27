import { useEffect, useState } from "react"
import type { TextFile } from "../types/memory"
import { generateId } from "../utils/id"
import { FloatingWindow } from "./FloatingWindow"

type Props = {
  title: string
  file: TextFile
  canManageAssets: boolean
  onCommit: (file: TextFile) => void
  onClose: () => void
}

export function CircleTextWindow({ title, file, canManageAssets, onCommit, onClose }: Props) {
  const [draft, setDraft] = useState<TextFile>({ ...file, assets: file.assets ?? [] })

  useEffect(() => setDraft({ ...file, assets: file.assets ?? [] }), [file])

  function close() {
    onCommit({ ...draft, assets: draft.assets ?? [] })
    onClose()
  }

  function addAsset(kind: "image" | "audio") {
    setDraft({
      ...draft,
      assets: [
        ...draft.assets,
        {
          id: generateId("asset"),
          kind,
          label: kind === "image" ? "image" : "audio",
          src: `/assets/${kind === "image" ? "images/untitled.jpg" : "audio/untitled.mp3"}`,
        },
      ],
    })
  }

  return (
    <FloatingWindow title={title} initialX={84} initialY={96} onClose={close}>
      <label className="field-label">
        filename
        <input
          className="text-input"
          value={draft.filename}
          onChange={(event) => setDraft({ ...draft, filename: event.target.value })}
        />
      </label>
      <label className="field-label">
        content
        <textarea
          className="text-area"
          value={draft.content}
          onChange={(event) => setDraft({ ...draft, content: event.target.value })}
        />
      </label>
      <div className="asset-section">
        <div className="asset-header">
          <span>assets</span>
          {canManageAssets && (
            <div>
              <button className="mini-button" onClick={() => addAsset("image")}>+ image</button>
              <button className="mini-button" onClick={() => addAsset("audio")}>+ audio</button>
            </div>
          )}
        </div>
        {draft.assets.map((asset) => (
          <div className="asset-row" key={asset.id}>
            <span className="asset-kind">{asset.kind}</span>
            {canManageAssets ? (
              <>
                <input
                  className="text-input"
                  value={asset.label}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      assets: draft.assets.map((item) =>
                        item.id === asset.id ? { ...item, label: event.target.value } : item,
                      ),
                    })
                  }
                />
                <input
                  className="text-input"
                  value={asset.src}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      assets: draft.assets.map((item) =>
                        item.id === asset.id ? { ...item, src: event.target.value } : item,
                      ),
                    })
                  }
                />
                <button
                  className="mini-button"
                  onClick={() => setDraft({ ...draft, assets: draft.assets.filter((item) => item.id !== asset.id) })}
                >
                  remove
                </button>
              </>
            ) : (
              <span className="asset-caption">{asset.label}</span>
            )}
            {asset.src && (
              <div className="asset-preview">
                {asset.kind === "image" ? (
                  <img src={asset.src} alt={asset.label || asset.src} />
                ) : (
                  <audio controls src={asset.src} />
                )}
                {asset.label && <div className="asset-caption">{asset.label}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </FloatingWindow>
  )
}
