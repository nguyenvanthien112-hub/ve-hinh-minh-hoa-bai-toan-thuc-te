export type SubjectId = 'auto' | 'math' | 'physics' | 'chemistry' | 'biology' | 'geography';

export interface SubjectDef {
  name: string;
  short: string;
  icon: string;
  spec: string;
}

export type StyleId = 'sgk' | 'bw' | 'board' | 'minimal' | 'classic';

export interface StyleDef {
  name: string;
  desc: string;
  dot: string;
  spec: string;
}

export interface ImagePayload {
  mime: string;
  data: string; // base64 không kèm tiền tố data:
  url: string;  // data URL để hiển thị thumbnail
}

export interface HistoryItem {
  id: number;
  t: number;
  title: string;
  problem: string;
  style: StyleId;
  subject?: SubjectId;
  svg: string;
  tikz: string;
  sol: string;
  promptText?: string;
}

export type TabId = 'draw' | 'svg' | 'tikz' | 'sol' | 'prompt';

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export interface ToastItem {
  id: number;
  msg: string;
  type: 'ok' | 'err';
}
