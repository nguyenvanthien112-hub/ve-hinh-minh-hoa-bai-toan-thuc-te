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
    title: '<i class="fas fa-circle-info text-primary me-2"></i> Hướng dẫn sử dụng — Phiên bản 5.0',
    width: 820,
    showCloseButton: true,
    confirmButtonText: 'Đã hiểu & Bắt đầu',
    confirmButtonColor: '#0d9488',
    html: `
      <div style="text-align:left; font-size: 0.92rem; line-height: 1.7;">
        <div class="mb-3 p-2 bg-light rounded-3 border">
          <b class="text-primary"><i class="fas fa-rocket me-1"></i> Quy trình vẽ nhanh:</b>
          <ol class="mb-0 ps-3 mt-1" style="line-height:1.75">
            <li><b>API Key (Cài đặt nâng cao):</b> Nhập key miễn phí từ <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>. Dán nhiều key (mỗi dòng 1 key) để tự động xoay vòng.</li>
            <li><b>Nhập đề bài:</b> Gõ nội dung đề, hoặc dán ảnh (Ctrl+V) / kéo thả ảnh đề bài vào ô chọn ảnh.</li>
            <li><b>Ảnh phác thảo (tuỳ chọn):</b> Chụp ảnh vẽ tay để AI định vị bố cục chính xác nhất.</li>
            <li><b>Chọn môn & Model:</b> Chọn đúng bộ môn (Toán, Lý, Hoá, Sinh, Địa) và Model AI trên thanh Header.</li>
            <li><b>Bấm thực hiện:</b>
              <ul class="ps-3 mb-1">
                <li><b>Vẽ hình minh hoạ:</b> AI trực tiếp tạo hình vẽ SVG chất lượng cao theo thời gian thực.</li>
                <li><b>Tạo Prompt (4 Blocks):</b> AI sinh bộ 4 câu lệnh chuyên sâu để bạn dán vào ChatGPT hoặc Claude.</li>
              </ul>
            </li>
          </ol>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <div class="p-2 border rounded-3 h-100 bg-light">
              <b class="text-success"><i class="fas fa-wand-magic-sparkles me-1"></i> Công cụ vẽ & Xuất file</b>
              <ul class="ps-3 mb-0 mt-1" style="font-size:0.85rem">
                <li><b>Chỉnh sửa trực tiếp:</b> Bấm <i>"Chỉnh sửa"</i> để click chọn, kéo dời hoặc đổi kích thước từng nét vẽ.</li>
                <li><b>Xuất đa định dạng:</b> Tải ảnh PNG chất lượng cao, file vector SVG hoặc tài liệu PDF A4.</li>
                <li><b>Copy nhanh:</b> Bấm <i>"Copy ảnh"</i> để dán trực tiếp vào Word, PowerPoint hoặc Zalo.</li>
              </ul>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2 border rounded-3 h-100 bg-light">
              <b class="text-warning text-dark"><i class="fas fa-keyboard me-1"></i> Phím tắt tiện lợi</b>
              <ul class="ps-3 mb-0 mt-1" style="font-size:0.85rem">
                <li><code>Ctrl + Enter</code>: Chạy vẽ hình ngay lập tức</li>
                <li><code>Ctrl + S</code> / <code>Ctrl + P</code>: Tải nhanh SVG / PNG</li>
                <li><code>Phím 1 – 5</code>: Chuyển đổi giữa 5 tab kết quả</li>
                <li><code>Esc</code>: Dừng tiến trình AI đang vẽ</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center pt-2 border-top text-muted" style="font-size:0.82rem">
          <span><i class="fas fa-shield-halved me-1 text-success"></i> Dữ liệu & API Key lưu an toàn tại trình duyệt máy bạn.</span>
          <span>Hỗ trợ kỹ thuật: Zalo <b>0988.250.112</b> (Nguyễn Thiện)</span>
        </div>
      </div>`,
  });
}
