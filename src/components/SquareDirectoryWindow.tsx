import { useEffect, useMemo, useState } from "react"
import type { SquareMemoryNode, TextFile } from "../types/memory"
import { generateId } from "../utils/id"
import { FloatingWindow } from "./FloatingWindow"

type Props = {
  node: SquareMemoryNode
  editMode: boolean
  onCommit: (node: SquareMemoryNode) => void
  onClose: () => void
  onOpenFile: (fileId: string) => void
  onRemoveOpenFile: (fileId: string) => void
}

export function SquareDirectoryWindow({ node, editMode, onCommit, onClose, onOpenFile, onRemoveOpenFile }: Props) {
  const [draft, setDraft] = useState(node)
  const [selectedFileId, setSelectedFileId] = useState(node.files[0]?.id ?? "")
  const selectedFile = useMemo(
    () => draft.files.find((file) => file.id === selectedFileId) ?? draft.files[0],
    [draft.files, selectedFileId],
  )

  useEffect(() => {
    setDraft(node)
    setSelectedFileId((current) => (node.files.some((file) => file.id === current) ? current : node.files[0]?.id ?? ""))
  }, [node])

  function setDraftAndCommit(next: SquareMemoryNode) {
    setDraft(next)
    onCommit(next)
  }

  function updateFile(next: TextFile) {
    setDraftAndCommit({
      ...draft,
      files: draft.files.map((file) => (file.id === next.id ? next : file)),
    })
  }

  function addFile() {
    if (!editMode) return
    const file = { id: generateId("file"), filename: "untitled.txt", content: "", assets: [] }
    setDraftAndCommit({ ...draft, files: [...draft.files, file] })
    setSelectedFileId(file.id)
  }

  function removeFile(fileId: string) {
    if (!editMode) return
    const files = draft.files.filter((file) => file.id !== fileId)
    setDraftAndCommit({ ...draft, files })
    if (selectedFileId === fileId) setSelectedFileId(files[0]?.id ?? "")
    onRemoveOpenFile(fileId)
  }

  function close() {
    onCommit(draft)
    onClose()
  }

  return (
    <FloatingWindow title={draft.title} initialX={window.innerWidth - 520} initialY={132} onClose={close}>
      <label className="field-label">
        directoryName
        <input
          className="text-input"
          value={draft.directoryName}
          onChange={(event) =>
            setDraftAndCommit({ ...draft, directoryName: event.target.value, title: event.target.value })
          }
        />
      </label>
      <div className="directory-grid" onDoubleClick={(event) => event.currentTarget === event.target && addFile()}>
        <div className="file-list">
          {draft.files.map((file) => (
            <button
              key={file.id}
              className={selectedFile?.id === file.id ? "file-row active" : "file-row"}
              onClick={() => {
                setSelectedFileId(file.id)
                onOpenFile(file.id)
              }}
              onDoubleClick={() => removeFile(file.id)}
            >
              {file.filename}
            </button>
          ))}
        </div>
        <div className="file-editor">
          {selectedFile ? (
            <label className="field-label">
              filename
              <input
                className="text-input"
                value={selectedFile.filename}
                onChange={(event) => updateFile({ ...selectedFile, filename: event.target.value })}
              />
            </label>
          ) : (
            <div className="empty-file-space" onDoubleClick={addFile} />
          )}
        </div>
      </div>
    </FloatingWindow>
  )
}
