/** Bỏ hàng rào ```…``` quanh khối mã. */
export function stripFence(input: string): string {
  return String(input || '')
    .replace(/^```[a-z]*\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

/** Loại bỏ mọi thành phần có thể chạy mã trong SVG do model trả về. */
export function sanitizeSvg(raw: string): string {
  let s = stripFence(raw);
  const i = s.indexOf('<svg');
  if (i > 0) s = s.slice(i);
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

/** Bổ sung xmlns / viewBox còn thiếu, trả về null nếu SVG hỏng. */
export function normalizeSvg(input: string): string | null {
  try {
    const doc = new DOMParser().parseFromString(input, 'image/svg+xml');
    if (doc.querySelector('parsererror')) return null;
    const svg = doc.querySelector('svg');
    if (!svg) return null;
    if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!svg.getAttribute('viewBox')) {
      const w = parseFloat(svg.getAttribute('width') || '') || 900;
      const h = parseFloat(svg.getAttribute('height') || '') || 620;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    return new XMLSerializer().serializeToString(svg);
  } catch {
    return null;
  }
}

export function cleanSvg(raw: string): string {
  const s = sanitizeSvg(raw);
  return normalizeSvg(s) ?? s;
}

export function getViewBox(svg: string): [number, number, number, number] {
  const m = svg.match(/viewBox\s*=\s*"([^"]+)"/);
  if (!m) return [0, 0, 900, 620];
  const v = m[1].trim().split(/[\s,]+/).map(Number);
  if (v.length !== 4 || v.some((n) => !isFinite(n))) return [0, 0, 900, 620];
  return [v[0], v[1], v[2], v[3]];
}

export interface ParsedOutput {
  svg: string;
  tikz: string;
  sol: string;
}

/** Tách ba phần theo dấu mốc do prompt quy định. */
export function splitOutput(text: string): ParsedOutput {
  const cut = (start: string, stops: string[]): string => {
    const i = text.indexOf(start);
    if (i < 0) return '';
    const from = i + start.length;
    let end = text.length;
    for (const s of stops) {
      const j = text.indexOf(s, from);
      if (j >= 0 && j < end) end = j;
    }
    return text.slice(from, end).trim();
  };
  return {
    svg: cut('<<<SVG>>>', ['<<<TIKZ>>>', '<<<LOIGIAI>>>', '<<<HET>>>']),
    tikz: cut('<<<TIKZ>>>', ['<<<LOIGIAI>>>', '<<<HET>>>']),
    sol: cut('<<<LOIGIAI>>>', ['<<<HET>>>']),
  };
}
