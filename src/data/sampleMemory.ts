import type { MemorySpaceData } from "../types/memory"

export const sampleMemory: MemorySpaceData = {
  nodes: [
    {
      id: "node_2009_live",
      kind: "circle",
      title: "2009 初ライブ",
      x: -220,
      y: -80,
      file: {
        id: "file_2009_live",
        filename: "first-live.txt",
        content: "アンプのノイズだけが先に鳴っていた。\n2009年、まだ誰も曲順を覚えていなかった。",
        assets: [],
      },
    },
    {
      id: "node_warp",
      kind: "square",
      title: "吉祥寺WARP",
      x: 120,
      y: -120,
      directoryName: "kichijoji_warp",
      files: [
        {
          id: "file_warp_map",
          filename: "floor-note.txt",
          content: "階段の湿った匂い。受付横の壁に、剥がれかけたフライヤー。",
          assets: [],
        },
        {
          id: "file_warp_setlist",
          filename: "setlist.txt",
          content: "intro / rain / narrow room / last train",
          assets: [],
        },
      ],
    },
    {
      id: "node_return",
      kind: "circle",
      title: "帰り道",
      x: 420,
      y: 120,
      file: {
        id: "file_return",
        filename: "last-train.txt",
        content: "終電の窓に、知らない街灯が何度も流れていった。",
        assets: [],
      },
    },
    {
      id: "node_2am",
      kind: "square",
      title: "深夜2時",
      x: -40,
      y: 230,
      directoryName: "2am_room",
      files: [
        {
          id: "file_2am_take",
          filename: "take_04.txt",
          content: "四回目の録音で、誰も話さなくなった。",
          assets: [],
        },
        {
          id: "file_2am_memo",
          filename: "memo.txt",
          content: "机の上に冷めた缶コーヒー。クリックだけが正確だった。",
          assets: [],
        },
      ],
    },
    {
      id: "node_rain",
      kind: "circle",
      title: "あの日の雨",
      x: -420,
      y: 190,
      file: {
        id: "file_rain",
        filename: "rain.txt",
        content: "あの日だけ、雨音が曲より大きかった。",
        assets: [],
      },
    },
  ],
  routes: [
    {
      id: "route_01",
      name: "route_01",
      edges: [
        { id: "edge_2009_warp", source: "node_2009_live", target: "node_warp" },
        { id: "edge_warp_return", source: "node_warp", target: "node_return" },
        { id: "edge_2009_rain", source: "node_2009_live", target: "node_rain" },
      ],
    },
    {
      id: "route_unknown",
      name: "???",
      edges: [
        { id: "edge_rain_2am", source: "node_rain", target: "node_2am" },
      ],
    },
  ],
}
