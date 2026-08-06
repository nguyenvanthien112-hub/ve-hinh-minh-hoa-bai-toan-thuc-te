import { getViewBox } from './svg';

export function slugify(input: string): string {
  const base = (input || 'hinh-minh-hoa')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
    .toLowerCase();
  return base || 'hinh-minh-hoa';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** Chèn nền trắng để ảnh xuất ra không bị trong suốt. */
export function withWhiteBackground(svg: string): string {
  const [x, y, w, h] = getViewBox(svg);
  return svg.replace(/(<svg[^>]*>)/, `$1<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff"/>`);
}

export async function svgToPngBlob(svg: string, scale = 3): Promise<Blob> {
  const source = withWhiteBackground(svg);
  const [, , vw, vh] = getViewBox(source);
  const width = Math.max(1, Math.round(vw * scale));
  const height = Math.max(1, Math.round(vh * scale));

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Không dựng được ảnh từ SVG.'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ canvas.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Không tạo được tệp PNG.');
  return blob;
}

/** Xuất hình ra PDF khổ A4, tự chọn hướng giấy theo tỉ lệ hình. */
export async function svgToPdf(svg: string, filename: string): Promise<void> {
  const blob = await svgToPngBlob(svg, 3);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Không đọc được ảnh tạm.'));
    reader.readAsDataURL(blob);
  });

  const { jsPDF } = await import('jspdf'); // tải khi cần để nhẹ bundle
  const [, , vw, vh] = getViewBox(svg);
  const pdf = new jsPDF({ orientation: vw >= vh ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const scale = Math.min((pageW - margin * 2) / vw, (pageH - margin * 2 - 24) / vh);
  const w = vw * scale;
  const h = vh * scale;

  pdf.addImage(dataUrl, 'PNG', (pageW - w) / 2, margin, w, h);
  pdf.setFontSize(9);
  pdf.setTextColor(120);
  pdf.text('Math Visualizer - Nguyen Thien - Zalo 0988.250.112', pageW / 2, pageH - 20, { align: 'center' });
  pdf.save(filename);
}
