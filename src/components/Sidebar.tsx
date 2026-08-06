import Card from './Card';
import ApiKeyPanel from './ApiKeyPanel';
import ImageDrop from './ImageDrop';
import { MODELS, type ModelChoice } from '../lib/gemini';
import { STYLES, STYLE_IDS } from '../data/styles';
import { LIBRARY_COUNT, QUICK_PICKS } from '../data/library';
import { SUBJECTS, SUBJECT_IDS } from '../data/subjects';
import type { HistoryItem, ImagePayload, StyleId, SubjectId } from '../types';
import type { Notify } from '../lib/ui';

const MODEL_LABEL: Record<string, string> = {
  'gemini-3.5-flash': 'Gemini 3.5 Flash',
  'gemini-3.5-flash-lite': 'Gemini 3.5 Flash Lite (nhanh nhất)',
  'gemini-3.6-flash': 'Gemini 3.6 Flash (mạnh nhất)',
};

interface Props {
  keysRaw: string;
  setKeysRaw: (v: string) => void;
  problem: string;
  setProblem: (v: string) => void;
  modelChoice: ModelChoice;
  setModelChoice: (v: ModelChoice) => void;
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
    <div className="d-flex flex-column gap-3">
      <ApiKeyPanel value={p.keysRaw} onChange={p.setKeysRaw} notify={p.notify} />

      <Card title="Nội dung đề bài" icon="fas fa-file-lines">
        <label className="form-label fw-semibold" style={{ fontSize: '.82rem' }}>
          <i className="fas fa-graduation-cap me-1 text-primary" />
          Bộ môn
        </label>
        <div className="d-flex flex-wrap gap-2 mb-3">
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

        <label className="form-label fw-semibold" style={{ fontSize: '.82rem' }}>
          <i className="fas fa-microchip me-1 text-primary" />
          Model
        </label>
        <select
          className="form-select mb-3"
          value={p.modelChoice}
          onChange={(e) => p.setModelChoice(e.target.value as ModelChoice)}
        >
          <option value="auto">Tự động xoay vòng 3 model (khuyên dùng)</option>
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {MODEL_LABEL[m]}
            </option>
          ))}
        </select>

        <textarea
          className="form-control"
          rows={5}
          value={p.problem}
          onChange={(e) => p.setProblem(e.target.value)}
          placeholder="Nhập đề bài toán… Hoặc dán ảnh (Ctrl+V) / kéo thả ảnh đề vào đây."
        />
        <div className="text-end text-muted mt-1" style={{ fontSize: '.72rem' }}>
          {p.problem.length} ký tự
        </div>

        <div className="mt-2">
          <ImageDrop
            title="Ảnh đề bài"
            hint="Dán Ctrl+V, kéo thả, hoặc bấm chọn ảnh."
            icon="fas fa-image"
            value={p.imgProblem}
            onChange={p.setImgProblem}
            notify={p.notify}
          />
        </div>
        <div className="mt-2">
          <ImageDrop
            title="Ảnh phác thảo (tuỳ chọn)"
            hint="Gửi bản vẽ tay để AI vẽ lại đúng góc nhìn."
            icon="fas fa-pen-ruler"
            value={p.imgSketch}
            onChange={p.setImgSketch}
            notify={p.notify}
          />
        </div>
      </Card>

      <Card title="Phong cách hình vẽ" icon="fas fa-palette">
        <div className="row g-2">
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

        <div className="d-flex flex-wrap gap-3 mt-3">
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

        <button className="btn btn-primary btn-run w-100 mt-3" onClick={p.onRun} disabled={p.busy}>
          <i className={'me-2 fas ' + (p.busy ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles')} />
          {p.busy ? 'Đang vẽ…' : 'Vẽ hình minh hoạ'}
          {!p.busy && <kbd>Ctrl ↵</kbd>}
        </button>
        {p.busy && (
          <button className="btn btn-outline-danger w-100 mt-2" onClick={p.onStop}>
            <i className="fas fa-stop me-1" />
            Dừng lại
          </button>
        )}
        {p.busy && (
          <div className="progress-slim">
            <i />
          </div>
        )}
        <div className="status-line">{p.status}</div>
      </Card>

      <Card title="Thư viện đề mẫu" icon="fas fa-book-open">
        <div className="d-flex flex-wrap gap-2">
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
        <button className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={p.onOpenLibrary}>
          <i className="fas fa-list me-1" />
          Mở thư viện đầy đủ ({LIBRARY_COUNT} đề)
        </button>
      </Card>

      <Card
        title="Lịch sử"
        icon="fas fa-clock-rotate-left"
        badge={<span className="badge bg-light text-dark">{p.history.length}</span>}
      >
        <div className="input-group mb-3">
          <span className="input-group-text bg-white" style={{ borderRadius: '12px 0 0 12px', border: '2px solid var(--border-color)' }}>
            <i className="fas fa-magnifying-glass text-primary" />
          </span>
          <input
            type="text"
            className="form-control"
            style={{ borderRadius: '0 12px 12px 0' }}
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
  );
}
