import Card from './Card';
import ApiKeyPanel from './ApiKeyPanel';
import ImageDrop from './ImageDrop';
import { STYLES, STYLE_IDS } from '../data/styles';
import { LIBRARY_COUNT, QUICK_PICKS } from '../data/library';
import { SUBJECTS, SUBJECT_IDS } from '../data/subjects';
import type { HistoryItem, ImagePayload, StyleId, SubjectId } from '../types';
import type { Notify } from '../lib/ui';

interface Props {
  keysRaw: string;
  setKeysRaw: (v: string) => void;
  problem: string;
  setProblem: (v: string) => void;
  style: StyleId;
  setStyle: (v: StyleId) => void;
  subject: SubjectId;
  setSubject: (v: SubjectId) => void;
  imgProblem: ImagePayload | null;
  setImgProblem: (v: ImagePayload | null) => void;
  imgSketch: ImagePayload | null;
  setImgSketch: (v: ImagePayload | null) => void;
  wantTikz: boolean;
  setWantTikz: (v: boolean) => void;
  wantSolution: boolean;
  setWantSolution: (v: boolean) => void;
  busy: boolean;
  status: string;
  onRun: () => void;
  onRunPrompt: () => void;
  onStop: () => void;
  history: HistoryItem[];
  historyQuery: string;
  setHistoryQuery: (v: string) => void;
  onOpenHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: number) => void;
  onClearHistory: () => void;
  onOpenLibrary: () => void;
  notify: Notify;
}

export default function Sidebar(p: Props) {
  const q = p.historyQuery.trim().toLowerCase();
  const filtered = p.history.filter((h) => !q || h.title.toLowerCase().includes(q));

  return (
    <div className="sidebar-wrapper">
      {/* Vùng có thể cuộn */}
      <div className="sidebar-scroll-area">

        {/* ── CARD 1: Nhập đề bài ── */}
        <Card title="Nhập đề bài" icon="fas fa-file-lines" className="mb-3">
          {/* Bộ môn */}
          <div className="mb-3">
            <div className="sidebar-label">
              <i className="fas fa-graduation-cap me-1 text-primary" /> Bộ môn
            </div>
            <div className="d-flex flex-wrap gap-1">
              {SUBJECT_IDS.map((id) => (
                <button
                  key={id}
                  className={'chip' + (id === p.subject ? ' active' : '')}
                  onClick={() => p.setSubject(id)}
                  title={SUBJECTS[id].name}
                >
                  <i className={SUBJECTS[id].icon + ' me-1'} />
                  {SUBJECTS[id].short}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea đề bài */}
          <textarea
            className="form-control mb-1"
            rows={5}
            value={p.problem}
            onChange={(e) => p.setProblem(e.target.value)}
            placeholder="Nhập đề bài… hoặc dán ảnh Ctrl+V / kéo thả ảnh vào đây."
          />
          <div className="text-end text-muted mb-2" style={{ fontSize: '.72rem' }}>
            {p.problem.length} ký tự
          </div>

          {/* Ảnh đề & phác thảo */}
          <div className="d-flex flex-column gap-2">
            <ImageDrop
              title="Ảnh đề bài"
              hint="Dán Ctrl+V, kéo thả hoặc bấm chọn ảnh"
              icon="fas fa-image"
              value={p.imgProblem}
              onChange={p.setImgProblem}
              notify={p.notify}
            />
            <ImageDrop
              title="Ảnh phác thảo (tuỳ chọn)"
              hint="Bản vẽ tay → AI vẽ lại đúng góc nhìn"
              icon="fas fa-pen-ruler"
              value={p.imgSketch}
              onChange={p.setImgSketch}
              notify={p.notify}
            />
          </div>
        </Card>

        {/* ── CARD 2: Cài đặt nâng cao (collapse mặc định) ── */}
        <Card title="Cài đặt nâng cao" icon="fas fa-sliders" defaultOpen={false} className="mb-3">
          {/* API Key */}
          <div className="mb-4">
            <ApiKeyPanel value={p.keysRaw} onChange={p.setKeysRaw} notify={p.notify} embedded />
          </div>

          {/* Phong cách vẽ */}
          <div className="sidebar-label mb-2">
            <i className="fas fa-palette me-1 text-primary" /> Phong cách hình vẽ
          </div>
          <div className="row g-2 mb-3">
            {STYLE_IDS.map((id) => (
              <div className="col-6" key={id}>
                <button
                  className={'style-btn' + (id === p.style ? ' active' : '')}
                  onClick={() => p.setStyle(id)}
                  aria-pressed={id === p.style}
                >
                  <i className="dot" style={{ background: STYLES[id].dot }} />
                  <span>
                    <span className="nm">{STYLES[id].name}</span>
                    <span className="ds">{STYLES[id].desc}</span>
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* Tuỳ chọn kết quả */}
          <div className="sidebar-label mb-2">
            <i className="fas fa-list-check me-1 text-primary" /> Kết quả trả về
          </div>
          <div className="d-flex flex-wrap gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="opt-sol"
                checked={p.wantSolution}
                onChange={(e) => p.setWantSolution(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="opt-sol" style={{ fontSize: '.82rem' }}>
                Kèm lời giải
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="opt-tikz"
                checked={p.wantTikz}
                onChange={(e) => p.setWantTikz(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="opt-tikz" style={{ fontSize: '.82rem' }}>
                Kèm mã TikZ
              </label>
            </div>
          </div>
        </Card>

        {/* ── CARD 3: Thư viện & Lịch sử (collapse mặc định) ── */}
        <Card
          title="Thư viện & Lịch sử"
          icon="fas fa-book-open"
          defaultOpen={false}
          badge={<span className="badge bg-light text-dark">{p.history.length}</span>}
          className="mb-3"
        >
          {/* Quick picks */}
          <div className="sidebar-label mb-2">
            <i className="fas fa-bolt me-1 text-primary" /> Đề mẫu nhanh
          </div>
          <div className="d-flex flex-wrap gap-1 mb-3">
            {QUICK_PICKS.map((item) => (
              <button
                key={item.label}
                className="chip"
                onClick={() => {
                  p.setProblem(item.problem);
                  p.setSubject(item.subject);
                }}
                title={SUBJECTS[item.subject].name}
              >
                <i className={SUBJECTS[item.subject].icon + ' me-1'} />
                {item.label}
              </button>
            ))}
          </div>
          <button className="btn btn-outline-primary btn-sm w-100 mb-4" onClick={p.onOpenLibrary}>
            <i className="fas fa-list me-1" />
            Mở thư viện đầy đủ ({LIBRARY_COUNT} đề)
          </button>

          {/* Lịch sử */}
          <div className="sidebar-label mb-2">
            <i className="fas fa-clock-rotate-left me-1 text-primary" /> Lịch sử
          </div>
          <div className="input-group mb-2">
            <span className="input-group-text bg-white" style={{ border: '1.5px solid var(--border-color)' }}>
              <i className="fas fa-magnifying-glass text-primary" style={{ fontSize: '.8rem' }} />
            </span>
            <input
              type="text"
              className="form-control"
              value={p.historyQuery}
              onChange={(e) => p.setHistoryQuery(e.target.value)}
              placeholder="Tìm trong lịch sử…"
            />
          </div>

          <div className="history-list">
            {filtered.length === 0 && (
              <p className="text-muted mb-0" style={{ fontSize: '.82rem' }}>
                Chưa có bản vẽ nào được lưu.
              </p>
            )}
            {filtered.map((h) => (
              <div key={h.id} className="history-item" onClick={() => p.onOpenHistory(h)}>
                <i className="fas fa-draw-polygon text-primary" />
                <div className="t">
                  <b>{h.title}</b>
                  <span>
                    {new Date(h.t).toLocaleString('vi-VN')} · {SUBJECTS[h.subject ?? 'auto']?.short ?? ''} ·{' '}
                    {STYLES[h.style]?.name ?? ''}
                  </span>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm"
                  title="Xoá mục này"
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onDeleteHistory(h.id);
                  }}
                >
                  <i className="fas fa-xmark" />
                </button>
              </div>
            ))}
          </div>

          <button className="btn btn-outline-danger btn-sm w-100 mt-3" onClick={p.onClearHistory}>
            <i className="fas fa-trash-can me-1" />
            Xoá toàn bộ lịch sử
          </button>
        </Card>
      </div>

      {/* ── STICKY ACTION BAR ── */}
      <div className="sidebar-action-bar">
        {p.busy && (
          <div className="progress-slim mb-2">
            <i />
          </div>
        )}
        {p.status && (
          <div className="status-line mb-2">{p.status}</div>
        )}
        {p.busy ? (
          <button className="btn btn-danger btn-run w-100" onClick={p.onStop}>
            <i className="fas fa-stop me-2" />
            Dừng lại
          </button>
        ) : (
          <>
            <button className="btn btn-primary btn-run w-100 mb-2" onClick={p.onRun}>
              <i className="fas fa-wand-magic-sparkles me-2" />
              Vẽ hình minh hoạ
              <kbd>Ctrl ↵</kbd>
            </button>
            <button className="btn btn-outline-primary btn-run w-100" onClick={p.onRunPrompt}>
              <i className="fas fa-rectangle-list me-2" />
              Tạo Prompt (4 Blocks)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
