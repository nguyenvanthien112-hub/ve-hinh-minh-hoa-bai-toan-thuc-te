import Swal from 'sweetalert2';
import { LIBRARY } from '../data/library';
import { SUBJECTS } from '../data/subjects';
import type { SubjectId } from '../types';

const escape = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  customClass: { popup: 'shadow' },
});

export type Notify = (msg: string, type?: 'ok' | 'err') => void;

export const notify: Notify = (msg, type = 'ok') => {
  void Toast.fire({ icon: type === 'err' ? 'error' : 'success', title: msg });
};

export async function confirmAction(title: string, text: string): Promise<boolean> {
  const r = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Huỷ',
    confirmButtonColor: '#0d9488',
    cancelButtonColor: '#6b7280',
  });
  return r.isConfirmed;
}

/** Mở thư viện đề mẫu, trả về đề đã chọn kèm môn tương ứng. */
export async function pickFromLibrary(): Promise<{ problem: string; subject: SubjectId } | null> {
  let picked: { problem: string; subject: SubjectId } | null = null;

  const html = LIBRARY.map(
    (g) =>
      `<div class="swal-lib-cat"><i class="${SUBJECTS[g.subject].icon}"></i> ${escape(g.cat)}</div>` +
      g.items
        .map(
          (p) =>
            `<button type="button" class="swal-lib-item" data-s="${g.subject}" data-p="${escape(p)}">${escape(p)}</button>`,
        )
        .join(''),
  ).join('');

  await Swal.fire({
    title: '<i class="fas fa-book-open text-primary"></i> Thư viện đề mẫu',
    html: `<div style="text-align:left;max-height:60vh;overflow:auto">${html}</div>`,
    width: 820,
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: (el) => {
      el.querySelectorAll<HTMLButtonElement>('.swal-lib-item').forEach((b) => {
        b.addEventListener('click', () => {
          picked = { problem: b.dataset.p ?? '', subject: (b.dataset.s ?? 'auto') as SubjectId };
          Swal.close();
        });
      });
    },
  });
  return picked;
}

export function showGuide(): void {
  void Swal.fire({
    title: '<i class="fas fa-circle-info text-primary"></i> Hướng dẫn nhanh',
    width: 780,
    showCloseButton: true,
    confirmButtonText: 'Đã hiểu',
    confirmButtonColor: '#0d9488',
    html: `
      <div style="text-align:left">
        <ol style="padding-left:20px;line-height:1.85">
          <li><b>Lấy API key</b> miễn phí tại
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>,
            dán vào ô Gemini API key rồi bấm <b>Lưu key</b>. Dán nhiều key, mỗi key một dòng, app tự đổi key khi một key bị giới hạn.</li>
          <li><b>Nhập đề bài</b> bằng cách gõ, dán ảnh (Ctrl+V) hoặc kéo thả ảnh chụp đề.</li>
          <li><b>Ảnh phác thảo</b> là tuỳ chọn: chụp bản vẽ tay để AI vẽ lại đúng bố cục mong muốn.</li>
          <li><b>Chọn môn</b> (Toán, Lý, Hoá, Sinh, Địa) để AI dùng đúng ký hiệu chuyên ngành, hoặc để <b>Tự nhận diện</b>.</li>
          <li><b>Chọn phong cách</b>: SGK cho bài giảng, Đen trắng cho đề in, Bảng phấn cho slide.</li>
          <li>Bấm <b>Vẽ hình minh hoạ</b> hoặc <b>Ctrl + Enter</b>. Hình hiện dần theo thời gian thực.</li>
          <li><b>Xuất kết quả</b>: PNG 3×, SVG, PDF khổ A4, copy ảnh dán thẳng vào Word / PowerPoint / Zalo, hoặc lấy mã TikZ.</li>
          <li>Hình chưa ưng? Bấm <b>Sửa lại hình</b> để AI tự rà soát và vẽ lại.</li>
        </ol>
        <p class="mb-1"><b>Phím tắt:</b> Ctrl+Enter vẽ · Ctrl+S tải SVG · Ctrl+P tải PNG · phím 1–4 chuyển tab · Esc dừng.</p>
        <p class="text-muted mb-0" style="font-size:.85rem">Mọi dữ liệu nằm trên máy bạn. Hỗ trợ: Zalo <b>0988.250.112</b> — Nguyễn Thiện.</p>
      </div>`,
  });
}
