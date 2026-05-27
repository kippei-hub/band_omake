import { sampleMemory } from "../data/sampleMemory"
import { generateId } from "./id"
import type { MediaAsset, MemoryNode, MemorySpaceData, TextFile } from "../types/memory"

const DEVELOPER_STORAGE_KEY = "memory-space-data"
const VIEWER_STORAGE_KEY = "memory-space-viewer-session"
const INITIAL_JSON_PATH = "/memory-space.json"

function isLocalPreviewHost() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname)
}

function isMemorySpaceData(value: unknown): value is MemorySpaceData {
  if (!value || typeof value !== "object") return false
  const data = value as MemorySpaceData
  return Array.isArray(data.nodes) && Array.isArray(data.routes)
}

function normalizeAsset(value: unknown): MediaAsset | undefined {
  if (!value || typeof value !== "object") return undefined
  const item = value as Partial<MediaAsset> & { type?: "image" | "audio" }
  const kind = item.kind ?? item.type
  if (kind !== "image" && kind !== "audio") return undefined
  return {
    id: typeof item.id === "string" ? item.id : generateId("asset"),
    kind,
    label: typeof item.label === "string" ? item.label : "",
    src: typeof item.src === "string" ? item.src : "",
  }
}

function normalizeTextFile(file: TextFile): TextFile {
  return {
    ...file,
    assets: Array.isArray(file.assets) ? file.assets.map(normalizeAsset).filter((asset): asset is MediaAsset => Boolean(asset)) : [],
  }
}

function normalizeNode(node: MemoryNode): MemoryNode {
  if (node.kind === "circle") {
    return { ...node, file: normalizeTextFile(node.file) }
  }
  return { ...node, files: node.files.map(normalizeTextFile) }
}

function normalizeMemoryData(data: MemorySpaceData): MemorySpaceData {
  return {
    ...data,
    nodes: data.nodes.map(normalizeNode),
  }
}

export function loadDeveloperMemory(): MemorySpaceData {
  const saved = localStorage.getItem(DEVELOPER_STORAGE_KEY)
  if (!saved) return loadBundledMemory()

  try {
    const parsed = JSON.parse(saved)
    return isMemorySpaceData(parsed) ? normalizeMemoryData(parsed) : loadBundledMemory()
  } catch {
    return loadBundledMemory()
  }
}

export function loadBundledMemory(): MemorySpaceData {
  return normalizeMemoryData(structuredClone(sampleMemory))
}

export function persistMemory(data: MemorySpaceData) {
  localStorage.setItem(DEVELOPER_STORAGE_KEY, JSON.stringify(data))
}

export function persistViewerMemory(data: MemorySpaceData) {
  sessionStorage.setItem(VIEWER_STORAGE_KEY, JSON.stringify(data))
}

export async function loadViewerMemory(): Promise<MemorySpaceData> {
  if (isLocalPreviewHost()) {
    const developerSaved = localStorage.getItem(DEVELOPER_STORAGE_KEY)
    if (developerSaved) {
      try {
        const parsed = JSON.parse(developerSaved)
        if (isMemorySpaceData(parsed)) {
          const normalized = normalizeMemoryData(parsed)
          persistViewerMemory(normalized)
          return normalized
        }
      } catch {
        // Ignore malformed local author data and continue to viewer/session/public data.
      }
    }
  }

  const saved = sessionStorage.getItem(VIEWER_STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (isMemorySpaceData(parsed)) return normalizeMemoryData(parsed)
    } catch {
      sessionStorage.removeItem(VIEWER_STORAGE_KEY)
    }
  }

  try {
    const response = await fetch(INITIAL_JSON_PATH, { cache: "no-store" })
    if (!response.ok) throw new Error("Initial JSON was not found")
    const parsed = await response.json()
    if (isMemorySpaceData(parsed)) {
      const normalized = normalizeMemoryData(parsed)
      persistViewerMemory(normalized)
      return normalized
    }
  } catch {
    // Fall through to the bundled sample if the deploy has no exported JSON yet.
  }

  const fallback = loadBundledMemory()
  persistViewerMemory(fallback)
  return fallback
}

export function downloadMemory(data: MemorySpaceData) {
  persistMemory(data)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "memory-space.json"
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readMemoryFile(file: File): Promise<MemorySpaceData> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  if (!isMemorySpaceData(parsed)) {
    throw new Error("Invalid memory-space JSON")
  }
  const normalized = normalizeMemoryData(parsed)
  persistMemory(normalized)
  return normalized
}
