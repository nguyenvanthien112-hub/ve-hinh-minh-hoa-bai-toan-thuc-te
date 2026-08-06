import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TabId } from '../types';
import { renderSolution } from '../lib/markdown';
import { downloadBlob, slugify, svgToPdf, svgToPngBlob } from '../lib/exporter';
import { STORAGE_KEYS, store } from '../lib/storage';
import type { Notify } from '../lib/ui';

interface Props {
  svg: string;
  tikz: string;
  solution: string;
  title: string;
  busy: boolean;
  tab: TabId;
  setTab: (t: TabId) => void;
  emptyTitle: string;
  emptyText: string;
  canFix: boolean;
  onFix: () => void;
  notify: Notify;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'draw', label: 'Hình vẽ', icon: 'fas fa-image' },
  { id: 'svg', label: 'Mã SVG', icon: 'fas fa-code' },
  { id: 'tikz', label: 'LaTeX (TikZ)', icon: 'fas fa-square-root-variable' },
  { id: 'sol', label: 'Lời giải', icon: 'fas fa-lightbulb' },
];

export default function Stage(p: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState(store.get(STORAGE_KEYS.grid) !== 'off');
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ on: false, x: 0, y: 0 });

  const solutionHtml = useMemo(() => renderSolution(p.solution), [p.solution]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [p.svg]);

  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!p.svg) return;
      e.preventDefault();
      setZoom((z) => Math.min(8, Math.max(0.2, z * (e.deltaY < 0 ? 1.12 : 1 / 1.12))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [p.svg]);

  const toggleGrid = () =>
    setGrid((g) => {
      store.set(STORAGE_KEYS.grid, g ? 'off' : 'on');
      return !g;
    });

  const copyText = async (value: string, label: string) => {
    if (!value) return p.notify('Chưa có nội dung để sao chép.', 'err');
    try {
      await navigator.clipboard.writeText(value);
      p.notify(`Đã sao chép ${label}.`);
    } catch {
      p.notify('Không sao chép được, hãy bôi đen thủ công.', 'err');
    }
  };

  const saveSvg = useCallback(() => {
    if (!p.svg) return p.notify('Chưa có hình để tải.', 'err');
    downloadBlob(new Blob([p.svg], { type: 'image/svg+xml;charset=utf-8' }), slugify(p.title) + '.svg');
    p.notify('Đã tải tệp SVG.');
  }, [p]);

  const savePng = useCallback(async () => {
    if (!p.svg) return p.notify('Chưa có hình để tải.', 'err');
    try {
      downloadBlob(await svgToPngBlob(p.svg, 3), slugify(p.title) + '.png');
      p.notify('Đã tải PNG độ phân giải 3×.');
    } catch (e) {
      p.notify((e as Error).message, 'err');
    }
  }, [p]);

  const savePdf = async () => {
    if (!p.svg) return p.notify('Chưa có hình để tải.', 'err');
    try {
      await svgToPdf(p.svg, slugify(p.title) + '.pdf');
      p.notify('Đã tải PDF khổ A4.');
    } catch (e) {
      p.notify((e as Error).message, 'err');
    }
  };

  const copyImage = async () => {
    if (!p.svg) return p.notify('Chưa có hình để copy.', 'err');
    try {
      const blob = await svgToPngBlob(p.svg, 2);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      p.notify('Đã copy ảnh, dán thẳng vào Word / PowerPoint / Zalo.');
    } catch {
      p.notify('Trình duyệt chặn copy ảnh, hãy dùng nút Tải PNG.', 'err');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        saveSvg();
      } else if (k === 'p') {
        e.preventDefault();
        void savePng();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveSvg, savePng]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageRef.current?.requestFullscreen();
  };

  return (
    <div className="card stage no-lift fade-in" ref={stageRef}>
      <div className="card-header">
        <i className="fas fa-compass-drafting" />
        <span>Khung dựng hình</span>
        <div className="ms-auto d-flex gap-2 flex-wrap">
          {p.canFix && (
            <button className="btn btn-glass btn-sm" onClick={p.onFix} disabled={p.busy} title="Gửi lại hình cho AI sửa">
              <i className="fas fa-rotate me-1" />
              Sửa lại hình
            </button>
          )}
          <button className="btn btn-glass btn-sm" onClick={toggleFullscreen} title="Toàn màn hình">
            <i className="fas fa-expand" />
          </button>
        </div>
      </div>

      <div className="card-body stage-body">
        <div className="toolbar">
          <ul className="nav nav-pills">
            {TABS.map((t) => (
              <li className="nav-item" key={t.id}>
                <button className={'nav-link' + (p.tab === t.id ? ' active' : '')} onClick={() => p.setTab(t.id)}>
                  <i className={t.icon + ' me-1'} />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="actions">
            <button className="btn btn-outline-primary btn-sm" onClick={toggleGrid} title="Bật / tắt lưới ô ly">
              <i className="fas fa-border-all" />
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => void copyImage()}>
              <i className="fas fa-copy me-1" />
              Copy ảnh
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => void savePng()}>
              <i className="fas fa-file-image me-1" />
              PNG
            </button>
            <button className="btn btn-outline-primary btn-sm" onClick={saveSvg}>
              <i className="fas fa-bezier-curve me-1" />
              SVG
            </button>
            <button className="btn btn-outline-primary btn-sm export-btn" onClick={() => void savePdf()}>
              <i className="fas fa-file-pdf me-1" />
              PDF
            </button>
          </div>
        </div>

        <section className={'pane' + (p.tab === 'draw' ? ' on' : '')}>
          <div
            ref={vpRef}
            className={'viewport' + (grid ? '' : ' nogrid') + (dragging ? ' drag' : '')}
            onPointerDown={(e) => {
              if (!p.svg) return;
              drag.current = { on: true, x: e.clientX, y: e.clientY };
              setDragging(true);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current.on) return;
              const dx = e.clientX - drag.current.x;
              const dy = e.clientY - drag.current.y;
              drag.current.x = e.clientX;
              drag.current.y = e.clientY;
              setPan((v) => ({ x: v.x + dx, y: v.y + dy }));
            }}
            onPointerUp={() => {
              drag.current.on = false;
              setDragging(false);
            }}
            onPointerCancel={() => {
              drag.current.on = false;
              setDragging(false);
            }}
          >
            <div
              className="canvas"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              dangerouslySetInnerHTML={{ __html: p.svg }}
            />
            {!p.svg && (
              <div className="empty-state">
                <div className="ic">
                  <i className={'fas ' + (p.busy ? 'fa-compass-drafting fa-beat-fade' : 'fa-shapes')} />
                </div>
                <h3>{p.emptyTitle}</h3>
                <p>{p.emptyText}</p>
              </div>
            )}
            <div className="zoombar">
              <button className="btn btn-outline-primary btn-sm" onClick={() => setZoom((z) => Math.max(0.2, z / 1.25))}>
                <i className="fas fa-minus" />
              </button>
              <b>{Math.round(zoom * 100)}%</b>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setZoom((z) => Math.min(8, z * 1.25))}>
                <i className="fas fa-plus" />
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                <i className="fas fa-compress me-1" />
                Vừa khung
              </button>
            </div>
          </div>
        </section>

        <section className={'pane' + (p.tab === 'svg' ? ' on' : '')}>
          <div className="p-3 pb-0">
            <button className="btn btn-outline-primary btn-sm" onClick={() => void copyText(p.svg, 'mã SVG')}>
              <i className="fas fa-copy me-1" />
              Sao chép mã SVG
            </button>
          </div>
          <pre className="code-pane">{p.svg || 'Chưa có mã SVG.'}</pre>
        </section>

        <section className={'pane' + (p.tab === 'tikz' ? ' on' : '')}>
          <div className="p-3 pb-0 d-flex align-items-center gap-2 flex-wrap">
            <button className="btn btn-outline-primary btn-sm" onClick={() => void copyText(p.tikz, 'mã TikZ')}>
              <i className="fas fa-copy me-1" />
              Sao chép mã TikZ
            </button>
            <span className="text-muted" style={{ fontSize: '.78rem' }}>
              Dán vào tài liệu LaTeX có gói <code>tikz</code>.
            </span>
          </div>
          <pre className="code-pane">{p.tikz && p.tikz !== '-' ? p.tikz : 'Chưa có mã TikZ.'}</pre>
        </section>

        <section className={'pane' + (p.tab === 'sol' ? ' on' : '')}>
          <div className="solution-pane" dangerouslySetInnerHTML={{ __html: solutionHtml }} />
        </section>
      </div>
    </div>
  );
}
