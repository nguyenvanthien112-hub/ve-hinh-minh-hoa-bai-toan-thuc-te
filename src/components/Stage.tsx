import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TabId } from '../types';
import ElementPropertiesPanel from './ElementPropertiesPanel';
import { translateElement, scaleElement, findClosestElement, getAllSelectableElements } from '../lib/svgEditor';
import { renderSolution } from '../lib/markdown';
import { downloadBlob, slugify, svgToPdf, svgToPngBlob } from '../lib/exporter';
import { exportSolutionToDocx } from '../lib/docxWordExporter';
import { STORAGE_KEYS, store } from '../lib/storage';
import type { Notify } from '../lib/ui';

interface Props {
  railHidden?: boolean;
  svg: string;
  tikz: string;
  solution: string;
  promptText: string;
  title: string;
  busy: boolean;
  tab: TabId;
  setTab: (t: TabId) => void;
  emptyTitle: string;
  emptyText: string;
  canFix: boolean;
  onFix: () => void;
  onUpdateSvg?: (svg: string) => void;
  onSyncTikz?: () => void;
  notify: Notify;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'draw', label: 'Hình vẽ', icon: 'fas fa-image' },
  { id: 'svg', label: 'Mã SVG', icon: 'fas fa-code' },
  { id: 'tikz', label: 'LaTeX (TikZ)', icon: 'fas fa-square-root-variable' },
  { id: 'sol', label: 'Lời giải', icon: 'fas fa-lightbulb' },
  { id: 'prompt', label: 'Prompt 4 Block', icon: 'fas fa-rectangle-list' },
];

function OverlayHandles({ element, zoom, onHandleDown }: { element: SVGElement, zoom: number, onHandleDown: (e: React.PointerEvent, cx: number, cy: number) => void }) {
  const [bbox, setBBox] = useState<{ x: number, y: number, width: number, height: number, cx: number, cy: number } | null>(null);

  useEffect(() => {
    if (element instanceof SVGGraphicsElement) {
      const b = element.getBBox();
      setBBox({ x: b.x, y: b.y, width: b.width, height: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 });
    }
  }, [element, element.getAttribute('d'), element.getAttribute('r'), element.getAttribute('transform')]);

  if (!bbox) return null;

  const handleSize = 8 / zoom;
  return (
    <>
      <rect 
         x={bbox.x} y={bbox.y} width={bbox.width} height={bbox.height} 
         fill="none" stroke="#0d6efd" strokeWidth={1/zoom} strokeDasharray={`${4/zoom},${4/zoom}`} 
      />
      <circle 
         cx={bbox.x + bbox.width} cy={bbox.y + bbox.height} r={handleSize} 
         fill="#fff" stroke="#0d6efd" strokeWidth={2/zoom} 
         style={{ pointerEvents: 'all', cursor: 'se-resize' }}
         onPointerDown={(e) => onHandleDown(e, bbox.cx, bbox.cy)}
      />
    </>
  );
}

export default function Stage(p: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState(store.get(STORAGE_KEYS.grid) !== 'off');
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ on: false, x: 0, y: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [originalSvg, setOriginalSvg] = useState<string>('');

  const editDrag = useRef<{ active: boolean, x: number, y: number, action: 'move'|'scale', cx: number, cy: number }>({ active: false, x: 0, y: 0, action: 'move', cx: 0, cy: 0 });

  const solutionHtml = useMemo(() => renderSolution(p.solution), [p.solution]);

  const isInternalEdit = useRef(false);

  useEffect(() => {
    if (isInternalEdit.current) {
      isInternalEdit.current = false;
      return;
    }
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedIndex(null);
    if (!isEditing) setOriginalSvg(p.svg);
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

  const commitSvgChange = useCallback(() => {
    if (!p.onUpdateSvg || !stageRef.current) return;
    const svgEl = stageRef.current.querySelector('.canvas svg');
    if (svgEl) {
      isInternalEdit.current = true;
      p.onUpdateSvg(svgEl.outerHTML);
    }
  }, [p]);

  const handleSelectElement = useCallback((el: SVGElement | null) => {
    if (!el || !stageRef.current) {
      setSelectedIndex(null);
      return;
    }
    const svgEl = stageRef.current.querySelector('.canvas svg') as SVGSVGElement | null;
    if (!svgEl) {
      setSelectedIndex(null);
      return;
    }
    const all = getAllSelectableElements(svgEl);
    const idx = all.findIndex(item => item.element === el);
    setSelectedIndex(idx >= 0 ? idx : null);
  }, []);

  const getSelectedElement = (): SVGElement | null => {
    if (selectedIndex === null || !stageRef.current) return null;
    const svgEl = stageRef.current.querySelector('.canvas svg') as SVGSVGElement | null;
    if (!svgEl) return null;
    const nodes = Array.from(svgEl.querySelectorAll('path, line, circle, ellipse, rect, text, polygon, polyline')) as SVGElement[];
    const filtered = nodes.filter(el => {
      if (el.tagName.toLowerCase() === 'rect') {
        const w = el.getAttribute('width');
        if (w === '100%' || parseFloat(w || '0') >= 700) return false;
      }
      return true;
    });
    return filtered[selectedIndex] || null;
  };

  const selectedElement = getSelectedElement();

  const handleRestore = () => {
    if (p.onUpdateSvg && originalSvg) {
      p.onUpdateSvg(originalSvg);
      setSelectedIndex(null);
      p.notify('Đã khôi phục ảnh gốc.');
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
            <button className={'btn btn-sm ' + (isEditing ? 'btn-primary' : 'btn-outline-primary')} onClick={() => setIsEditing(!isEditing)} title="Bật/tắt chế độ chỉnh sửa">
              <i className="fas fa-pen-pointer" /> Chỉnh sửa
            </button>
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
          <div className={`d-flex gap-3 ${p.railHidden ? 'flex-column flex-lg-row align-items-start' : 'flex-column'}`}>
            <div
              ref={vpRef}
              className={'viewport' + (grid ? '' : ' nogrid') + (dragging ? ' drag' : '')}
              style={{ 
                position: 'relative', 
                minWidth: 0,
                flex: p.railHidden ? '1 1 50%' : '1 1 100%',
                width: '100%',
                height: isEditing ? 560 : undefined,
                minHeight: 480
              }}
              onPointerDown={(e) => {
                if (!p.svg || isEditing) return; // Disable viewport pan in edit mode to prevent image drift
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
              <style>
                {`
                  .canvas.is-editing svg * {
                    cursor: pointer !important;
                    pointer-events: all !important;
                  }
                  .canvas.is-editing svg rect[width="100%"] {
                    pointer-events: none !important;
                  }
                  .canvas.is-editing svg *:hover {
                    stroke: #0d6efd !important;
                    stroke-width: max(2px, calc(3px / var(--zoom, 1))) !important;
                    filter: drop-shadow(0 0 5px rgba(13, 110, 253, 0.8)) !important;
                  }
                `}
              </style>
              <div
                className={`canvas ${isEditing ? 'is-editing' : ''}`}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
                dangerouslySetInnerHTML={{ __html: p.svg }}
                onPointerDown={(e) => {
                  if (!isEditing || !p.svg) return;
                  
                  let targetEl: SVGElement | null = null;
                  const directTarget = e.target as SVGElement;
                  
                  if (directTarget.tagName !== 'svg' && directTarget.closest('svg')) {
                    if (directTarget.tagName === 'rect') {
                       const w = directTarget.getAttribute('width');
                       if (w !== '100%' && parseFloat(w || '0') < 700) {
                          targetEl = directTarget;
                       }
                    } else {
                       targetEl = directTarget;
                    }
                  }

                  // Smart nearest element fallback (if user missed by up to 60px)
                  if (!targetEl && stageRef.current) {
                    const svgEl = stageRef.current.querySelector('.canvas svg') as SVGSVGElement;
                    if (svgEl) {
                      targetEl = findClosestElement(svgEl, e.clientX, e.clientY, 60);
                    }
                  }

                  if (targetEl) {
                    handleSelectElement(targetEl);
                    editDrag.current = { active: true, x: e.clientX, y: e.clientY, action: 'move', cx: 0, cy: 0 };
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } else {
                    setSelectedIndex(null);
                  }
                }}
                onPointerMove={(e) => {
                  if (editDrag.current.active && selectedElement) {
                    const dx = (e.clientX - editDrag.current.x) / zoom;
                    const dy = (e.clientY - editDrag.current.y) / zoom;
                    editDrag.current.x = e.clientX;
                    editDrag.current.y = e.clientY;
                    
                    if (editDrag.current.action === 'move') {
                      translateElement(selectedElement, dx, dy);
                    } else if (editDrag.current.action === 'scale') {
                      const scaleFactor = 1 + (dx - dy) * 0.01;
                      scaleElement(selectedElement, scaleFactor, editDrag.current.cx, editDrag.current.cy);
                    }
                  }
                }}
                onPointerUp={() => {
                  if (editDrag.current.active) {
                    editDrag.current.active = false;
                    commitSvgChange();
                  }
                }}
              />
              {isEditing && selectedElement && (
                <div 
                  className="editor-overlay" 
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none', transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
                >
                  <OverlayHandles 
                     element={selectedElement} 
                     zoom={zoom}
                     onHandleDown={(e, cx, cy) => {
                       editDrag.current = { active: true, x: e.clientX, y: e.clientY, action: 'scale', cx, cy };
                       e.stopPropagation();
                       if (e.currentTarget instanceof Element) {
                         e.currentTarget.setPointerCapture(e.pointerId);
                       }
                     }} 
                  />
                </div>
              )}
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

            {isEditing && (
              <div 
                 className="edit-panel-wrapper mt-3 mt-lg-0 shadow-sm rounded-3" 
                 style={{ 
                   flex: p.railHidden ? '1 1 50%' : '1 1 100%',
                   minWidth: 0,
                   width: '100%',
                   maxHeight: 560,
                   overflowY: 'auto'
                 }}
              >
                <ElementPropertiesPanel
                   selectedElement={selectedElement}
                   svgContainer={stageRef.current?.querySelector('.canvas svg') || null}
                   onSelectElement={handleSelectElement}
                   onChange={commitSvgChange}
                   onSyncTikz={() => { p.onSyncTikz?.(); p.notify('Đang gửi yêu cầu đồng bộ TikZ...'); }}
                   onRestore={handleRestore}
                />
              </div>
            )}
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
            <button className="btn btn-primary btn-sm" onClick={() => { p.onSyncTikz?.(); p.notify('Đang phân tích hình ảnh và cập nhật lại mã TikZ...'); }}>
              <i className="fas fa-arrows-rotate me-1" />
              Đồng bộ lại TikZ theo hình vừa chỉnh
            </button>
            <span className="text-muted" style={{ fontSize: '.78rem' }}>
              Dán vào tài liệu LaTeX có gói <code>tikz</code>.
            </span>
          </div>
          <pre className="code-pane">{p.tikz && p.tikz !== '-' ? p.tikz : 'Chưa có mã TikZ.'}</pre>
        </section>

        <section className={'pane' + (p.tab === 'sol' ? ' on' : '')}>
          {p.solution && (
            <div className="p-3 pb-0 d-flex align-items-center gap-2 flex-wrap">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => void copyText(p.solution, 'lời giải')}
              >
                <i className="fas fa-copy me-1" />
                Sao chép lời giải
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  void exportSolutionToDocx({
                    title: p.title || 'Lời giải',
                    content: p.solution,
                    fileName: slugify(p.title || 'loi-giai'),
                  }).then(() => p.notify('Đã tải file Word chứa công thức Equation chuẩn Office!'))
                    .catch(() => p.notify('Không thể tạo file Word.', 'err'))
                }
                title="Tải file Word (.docx) có công thức Word Equation chuẩn Microsoft Office, mở bằng Word/LibreOffice"
              >
                <i className="fas fa-file-word me-1" />
                Tải Word (Equation)
              </button>
            </div>
          )}
          <div className="solution-pane" dangerouslySetInnerHTML={{ __html: solutionHtml }} />
        </section>

        <section className={'pane' + (p.tab === 'prompt' ? ' on' : '')}>
          <div className="p-3 pb-0 d-flex align-items-center gap-2 flex-wrap">
            <button className="btn btn-outline-primary btn-sm" onClick={() => void copyText(p.promptText, 'nội dung Prompt')}>
              <i className="fas fa-copy me-1" />
              Sao chép toàn bộ Prompt
            </button>
            <span className="text-muted" style={{ fontSize: '.78rem' }}>
              Dán vào ChatGPT hoặc Claude để nhận ảnh/code TikZ.
            </span>
          </div>
          <pre className="code-pane" style={{ whiteSpace: 'pre-wrap' }}>
            {p.promptText || 'Chưa có dữ liệu Prompt.'}
          </pre>
        </section>
      </div>
    </div>
  );
}
