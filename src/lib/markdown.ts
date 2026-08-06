import katex from 'katex';

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Chuyển lời giải Markdown rút gọn + công thức LaTeX thành HTML.
 * Công thức được tách ra trước khi escape để KaTeX nhận đúng ký tự gốc.
 */
export function renderSolution(md: string): string {
  if (!md || md.trim() === '-') {
    return '<p class="muted">Chưa có lời giải cho hình này.</p>';
  }
  const math: { src: string; display: boolean }[] = [];
  let t = md
    .replace(/\$\$([\s\S]+?)\$\$/g, (_m, x: string) => `\u0000${math.push({ src: x, display: true }) - 1}\u0000`)
    .replace(/\$([^\n$]+?)\$/g, (_m, x: string) => `\u0000${math.push({ src: x, display: false }) - 1}\u0000`);

  t = escapeHtml(t)
    .replace(/^#{1,4}\s*(.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>')
    .split(/\n{2,}/)
    .map((p) => (/^<(h3|ul|ol)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`))
    .join('');

  return t.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => {
    const item = math[Number(i)];
    try {
      return katex.renderToString(item.src, {
        displayMode: item.display,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return escapeHtml(item.src);
    }
  });
}
