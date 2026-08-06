import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Stage from './components/Stage';
import { readImageFile } from './components/ImageDrop';
import { confirmAction, notify, pickFromLibrary, showGuide } from './lib/ui';
import { STORAGE_KEYS, store, storageAvailable } from './lib/storage';
import { buildSystemPrompt, buildUserPrompt, generate, parseKeys, type ModelChoice } from './lib/gemini';
import { cleanSvg, splitOutput, stripFence } from './lib/svg';
import type { GeminiPart, HistoryItem, ImagePayload, StyleId, SubjectId, TabId } from './types';
import { getLicenseStatus } from './lib/license';
import LicenseModal from './components/LicenseModal';
import AdminKeygenModal from './components/AdminKeygenModal';

const EMPTY_TITLE = 'Khung hiển thị hình minh hoạ';
const EMPTY_TEXT =
  'Nhập đề bài ở cột trái hoặc chọn một đề mẫu, rồi bấm Vẽ hình minh hoạ. Hình được tạo dưới dạng SVG nên phóng to bao nhiêu cũng nét.';

function loadHistory(): HistoryItem[] {
  try {
    const raw = store.get(STORAGE_KEYS.history);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [railHidden, setRailHidden] = useState(false);
  const [keysRaw, setKeysRaw] = useState(() => store.get(STORAGE_KEYS.keys) ?? '');
  const [problem, setProblem] = useState('');
  const [modelChoice, setModelChoice] = useState<ModelChoice>(
    () => (store.get(STORAGE_KEYS.model) as ModelChoice | null) ?? 'auto',
  );
  const [style, setStyle] = useState<StyleId>(() => (store.get(STORAGE_KEYS.style) as StyleId | null) ?? 'sgk');
  const [subject, setSubject] = useState<SubjectId>(
    () => (store.get(STORAGE_KEYS.subject) as SubjectId | null) ?? 'auto',
  );
  const [imgProblem, setImgProblem] = useState<ImagePayload | null>(null);
  const [imgSketch, setImgSketch] = useState<ImagePayload | null>(null);
  const [wantTikz, setWantTikz] = useState(true);
  const [wantSolution, setWantSolution] = useState(true);

  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [licenseRefresh, setLicenseRefresh] = useState(0);

  // Keyboard shortcut Ctrl + Shift + A for Admin Keygen Tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [svg, setSvg] = useState('');
  const [tikz, setTikz] = useState('');
  const [solution, setSolution] = useState('');
  const [title, setTitle] = useState('hinh-minh-hoa');
  const [tab, setTab] = useState<TabId>('draw');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [emptyTitle, setEmptyTitle] = useState(EMPTY_TITLE);
  const [emptyText, setEmptyText] = useState(EMPTY_TEXT);

  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [historyQuery, setHistoryQuery] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  const rotation = useRef({ model: 0, key: 0 });
  const lastPaint = useRef(0);

  /* ---------- Ghi nhớ tuỳ chọn ---------- */
  useEffect(() => store.set(STORAGE_KEYS.style, style), [style]);
  useEffect(() => store.set(STORAGE_KEYS.subject, subject), [subject]);
  useEffect(() => store.set(STORAGE_KEYS.model, modelChoice), [modelChoice]);
  useEffect(() => {
    store.set(STORAGE_KEYS.options, JSON.stringify({ tikz: wantTikz, sol: wantSolution }));
  }, [wantTikz, wantSolution]);
  useEffect(() => {
    try {
      const raw = store.get(STORAGE_KEYS.options);
      if (raw) {
        const o = JSON.parse(raw) as { tikz?: boolean; sol?: boolean };
        if (typeof o.tikz === 'boolean') setWantTikz(o.tikz);
        if (typeof o.sol === 'boolean') setWantSolution(o.sol);
      }
    } catch {
      /* bỏ qua */
    }
  }, []);

  /* ---------- Dán ảnh từ clipboard ---------- */
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (!file) return;
      const img = await readImageFile(file, notify);
      if (img) {
        setImgProblem(img);
        notify('Đã nhận ảnh đề từ clipboard.');
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  /* ---------- Lưu lịch sử ---------- */
  const pushHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 25);
      try {
        store.set(STORAGE_KEYS.history, JSON.stringify(next));
      } catch {
        const small = next.slice(0, 8);
        try {
          store.set(STORAGE_KEYS.history, JSON.stringify(small));
        } catch {
          /* bỏ qua */
        }
        return small;
      }
      return next;
    });
  }, []);

  /* ---------- Chạy sinh hình ---------- */
  const run = useCallback(
    async (extra?: string) => {
      if (busy) return;
      const keys = parseKeys(keysRaw);
      const lic = getLicenseStatus();
      if (lic.isExpired) {
        notify('⛔ Ứng dụng đã hết hạn dùng thử. Vui lòng kích hoạt bản quyền PRO để tiếp tục.', 'err');
        setIsLicenseOpen(true);
        return;
      }

      if (!problem.trim() && !imgProblem && !imgSketch) {
        notify('Vui lòng nhập đề bài hoặc tải ảnh lên.', 'err');
        return;
      }
      if (!keys.length) {
        notify('Chưa có API key. Dán key ở khung đầu tiên.', 'err');
        return;
      }

      const parts: GeminiPart[] = [
        { text: buildUserPrompt({ problem: problem.trim(), wantTikz, wantSolution, extra }) },
      ];
      if (imgProblem) {
        parts.push({ text: 'Ảnh đề bài:' });
        parts.push({ inline_data: { mime_type: imgProblem.mime, data: imgProblem.data } });
      }
      if (imgSketch) {
        parts.push({ text: 'Ảnh phác thảo cần vẽ lại cho chuẩn:' });
        parts.push({ inline_data: { mime_type: imgSketch.mime, data: imgSketch.data } });
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      setTab('draw');
      setSvg('');
      setEmptyTitle('Đang dựng hình…');
      setEmptyText('AI đang phân tích đề và vẽ từng nét. Hình sẽ hiện dần ngay tại đây.');
      const startedAt = performance.now();
      const heading = problem.trim() || '(đề bài từ ảnh)';

      try {
        const result = await generate({
          keys,
          modelChoice,
          system: buildSystemPrompt(style, subject),
          parts,
          signal: controller.signal,
          startModelIndex: rotation.current.model,
          startKeyIndex: rotation.current.key,
          onStatus: setStatus,
          onDelta: (full) => {
            const now = Date.now();
            if (now - lastPaint.current < 220) return;
            lastPaint.current = now;
            const partial = splitOutput(full);
            if (partial.svg.includes('</svg>')) setSvg(cleanSvg(partial.svg));
          },
        });

        rotation.current = { model: result.nextModelIndex, key: result.usedKeyIndex };
        const parsed = splitOutput(result.text);
        const finalSvg = cleanSvg(stripFence(parsed.svg));
        if (!finalSvg.includes('<svg')) {
          throw new Error('Model không trả về SVG hợp lệ. Thử lại hoặc đổi model.');
        }

        setSvg(finalSvg);
        setTikz(stripFence(parsed.tikz));
        setSolution(parsed.sol);
        setTitle(heading);
        setStatus(`Xong sau ${((performance.now() - startedAt) / 1000).toFixed(1)}s bằng ${result.model}.`);
        notify('Đã vẽ xong hình minh hoạ.');
        pushHistory({
          id: Date.now(),
          t: Date.now(),
          title: heading.slice(0, 90),
          problem: heading,
          style,
          subject,
          svg: finalSvg,
          tikz: stripFence(parsed.tikz),
          sol: parsed.sol,
        });
      } catch (err) {
        const e = err as Error;
        if (e.name === 'AbortError') {
          setStatus('Đã dừng theo yêu cầu.');
        } else {
          setStatus('Lỗi: ' + e.message);
          notify('Không vẽ được: ' + e.message, 'err');
          setEmptyTitle('Chưa vẽ được hình');
          setEmptyText(e.message);
        }
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [busy, keysRaw, problem, imgProblem, imgSketch, wantTikz, wantSolution, modelChoice, style, subject, pushHistory],
  );

  /* ---------- Phím tắt ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void run();
        return;
      }
      if (e.key === 'Escape' && abortRef.current) {
        abortRef.current.abort();
        return;
      }
      if (!typing && ['1', '2', '3', '4'].includes(e.key)) {
        setTab((['draw', 'svg', 'tikz', 'sol'] as TabId[])[Number(e.key) - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run]);

  const openHistory = (h: HistoryItem) => {
    setSvg(h.svg);
    setTikz(h.tikz);
    setSolution(h.sol);
    setProblem(h.problem);
    if (h.subject) setSubject(h.subject);
    setTitle(h.problem);
    setTab('draw');
    notify('Đã mở lại bản vẽ trong lịch sử.');
  };

  const deleteHistory = (id: number) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      store.set(STORAGE_KEYS.history, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = async () => {
    if (!history.length) return;
    const ok = await confirmAction('Xoá toàn bộ lịch sử?', 'Tất cả bản vẽ đã lưu trên máy sẽ bị xoá vĩnh viễn.');
    if (!ok) return;
    setHistory([]);
    store.remove(STORAGE_KEYS.history);
    notify('Đã xoá lịch sử.');
  };

  const openLibrary = async () => {
    const chosen = await pickFromLibrary();
    if (chosen) {
      setProblem(chosen.problem);
      setSubject(chosen.subject);
      notify('Đã nạp đề mẫu vào khung nhập.');
    }
  };

  return (
    <>
      <Header
        keyCount={parseKeys(keysRaw).length}
        railHidden={railHidden}
        refreshKey={licenseRefresh}
        onToggleRail={() => setRailHidden((v) => !v)}
        onOpenGuide={showGuide}
        onOpenLicense={() => setIsLicenseOpen(true)}
        onOpenAdminKeygen={() => setIsAdminOpen(true)}
      />

      <div className="main-content fade-in">
        {!storageAvailable && (
          <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
            <i className="fas fa-triangle-exclamation" />
            Trình duyệt đang chặn bộ nhớ cục bộ, nên API key và lịch sử chỉ được giữ trong phiên làm việc này.
          </div>
        )}

        <div className="row g-4">
          {!railHidden && (
            <div className="col-12 col-xl-4 rail-col">
              <Sidebar
                keysRaw={keysRaw}
                setKeysRaw={setKeysRaw}
                problem={problem}
                setProblem={setProblem}
                modelChoice={modelChoice}
                setModelChoice={setModelChoice}
                style={style}
                setStyle={setStyle}
                subject={subject}
                setSubject={setSubject}
                imgProblem={imgProblem}
                setImgProblem={setImgProblem}
                imgSketch={imgSketch}
                setImgSketch={setImgSketch}
                wantTikz={wantTikz}
                setWantTikz={setWantTikz}
                wantSolution={wantSolution}
                setWantSolution={setWantSolution}
                busy={busy}
                status={status}
                onRun={() => void run()}
                onStop={() => abortRef.current?.abort()}
                history={history}
                historyQuery={historyQuery}
                setHistoryQuery={setHistoryQuery}
                onOpenHistory={openHistory}
                onDeleteHistory={deleteHistory}
                onClearHistory={() => void clearHistory()}
                onOpenLibrary={() => void openLibrary()}
                notify={notify}
              />
            </div>
          )}

          <div className={railHidden ? 'col-12' : 'col-12 col-xl-8'}>
            <Stage
              railHidden={railHidden}
              svg={svg}
              tikz={tikz}
              solution={solution}
              title={title}
              busy={busy}
              tab={tab}
              setTab={setTab}
              emptyTitle={emptyTitle}
              emptyText={emptyText}
              canFix={Boolean(svg)}
              onFix={() =>
                void run(
                  'Bản vẽ trước đây chưa chuẩn. Hãy tự rà soát lại tỉ lệ, vị trí nhãn có bị chồng lấn không, ký hiệu góc vuông, mũi tên kích thước, rồi vẽ lại bản mới đẹp và chính xác hơn.\n\nSVG lần trước:\n' +
                    svg.slice(0, 6000),
                )
              }
              onUpdateSvg={(newSvg) => {
                setSvg(newSvg);
                // Also update the latest history item so we don't lose edits
                setHistory((prev) => {
                  if (!prev.length) return prev;
                  const next = [...prev];
                  next[0] = { ...next[0], svg: newSvg };
                  try { store.set(STORAGE_KEYS.history, JSON.stringify(next)); } catch {}
                  return next;
                });
              }}
              onSyncTikz={() => {
                void run('Dựa vào hình ảnh SVG cập nhật sau đây, hãy viết lại mã TikZ cho chính xác. Trả về đúng định dạng có mốc phân cách nhé.\n\nSVG:\n' + svg);
              }}
              notify={notify}
            />
          </div>
        </div>

        <footer className="credit-footer text-center text-muted pt-4 pb-2" style={{ fontSize: '.85rem' }}>
          <i className="fas fa-shapes text-primary me-1" />
          <b>Math Visualizer 2.0</b> · Tác giả <b className="cursor-pointer text-dark text-decoration-underline" onClick={() => setIsAdminOpen(true)}>Nguyễn Thiện</b> ·{' '}
          <a href="https://zalo.me/0988250112" target="_blank" rel="noopener noreferrer" className="fw-bold text-decoration-none">
            Zalo 0988.250.112
          </a>
          <br />
          Ứng dụng chạy hoàn toàn trên trình duyệt của bạn — không có máy chủ trung gian. Bản quyền © 2026.
        </footer>
      </div>

      {/* License Modal for Users */}
      <LicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
        notify={notify}
        onLicenseChanged={() => setLicenseRefresh((v) => v + 1)}
      />

      {/* Secret Admin Keygen Modal */}
      <AdminKeygenModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        notify={notify}
      />
    </>
  );
}
