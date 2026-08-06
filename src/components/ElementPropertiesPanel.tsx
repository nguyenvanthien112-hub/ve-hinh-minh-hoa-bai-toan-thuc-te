import { useEffect, useState } from 'react';
import { 
  translateElement, 
  scaleElement, 
  scaleAxisElement, 
  duplicateElement, 
  getElementCenter,
  getAllSelectableElements 
} from '../lib/svgEditor';

interface Props {
  selectedElement: SVGElement | null;
  svgContainer: SVGSVGElement | null;
  onSelectElement: (el: SVGElement | null) => void;
  onChange: () => void;
  onSyncTikz: () => void;
  onRestore: () => void;
  onAddText?: () => void;
  onAddLine?: () => void;
}

const PRESET_COLORS = [
  '#dc3545', // Red
  '#0d6efd', // Blue
  '#198754', // Green
  '#0dcaf0', // Cyan
  '#fd7e14', // Orange
  '#ffc107', // Yellow
  '#6c757d', // Grey
  '#212529', // Dark
  '#000000', // Black
  '#ffffff', // White
];

export default function ElementPropertiesPanel({
  selectedElement,
  svgContainer,
  onSelectElement,
  onChange,
  onSyncTikz,
  onRestore,
  onAddText,
  onAddLine,
}: Props) {
  const [step, setStep] = useState<number>(5);
  const [elementsList, setElementsList] = useState<{ element: SVGElement; label: string }[]>([]);
  const [stroke, setStroke] = useState('#000000');
  const [fill, setFill] = useState('none');
  const [opacity, setOpacity] = useState('1');
  const [textValue, setTextValue] = useState('');

  // Update elements list when svgContainer or selection changes
  useEffect(() => {
    if (svgContainer) {
      setElementsList(getAllSelectableElements(svgContainer));
    } else {
      setElementsList([]);
    }
  }, [svgContainer, selectedElement]);

  useEffect(() => {
    if (!selectedElement) return;
    setStroke(selectedElement.getAttribute('stroke') || selectedElement.style.stroke || '#000000');
    setFill(selectedElement.getAttribute('fill') || selectedElement.style.fill || 'none');
    setOpacity(selectedElement.getAttribute('opacity') || selectedElement.style.opacity || '1');
    
    if (selectedElement.tagName.toLowerCase() === 'text' || selectedElement.tagName.toLowerCase() === 'tspan') {
      setTextValue(selectedElement.textContent || '');
    }
  }, [selectedElement]);

  // Keyboard shortcut listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudge(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudge(0, step);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudge(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudge(step, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, step]);

  const nudge = (dx: number, dy: number) => {
    if (!selectedElement) return;
    translateElement(selectedElement, dx, dy);
    onChange();
  };

  const handleScaleOverall = (factor: number) => {
    if (!selectedElement) return;
    const center = getElementCenter(selectedElement);
    scaleElement(selectedElement, factor, center.x, center.y);
    onChange();
  };

  const handleScaleAxis = (sx: number, sy: number) => {
    if (!selectedElement) return;
    scaleAxisElement(selectedElement, sx, sy);
    onChange();
  };

  const handleSetOpacity = (val: string) => {
    if (!selectedElement) return;
    setOpacity(val);
    selectedElement.setAttribute('opacity', val);
    selectedElement.style.opacity = val;
    onChange();
  };

  const handleApplyColor = (color: string) => {
    if (!selectedElement) return;
    const tag = selectedElement.tagName.toLowerCase();
    if (tag === 'path' || tag === 'line' || tag === 'polyline') {
      setStroke(color);
      selectedElement.setAttribute('stroke', color);
      selectedElement.style.stroke = color;
    } else {
      setFill(color);
      selectedElement.setAttribute('fill', color);
      selectedElement.style.fill = color;
    }
    onChange();
  };

  const handleDelete = () => {
    if (!selectedElement || !selectedElement.parentNode) return;
    selectedElement.parentNode.removeChild(selectedElement);
    onSelectElement(null);
    onChange();
  };

  const handleDuplicate = () => {
    if (!selectedElement) return;
    const clone = duplicateElement(selectedElement);
    if (clone) {
      onSelectElement(clone);
      onChange();
    }
  };

  const handleResetDefault = () => {
    if (!selectedElement) return;
    selectedElement.removeAttribute('transform');
    onChange();
  };

  const handleUpdateText = (val: string) => {
    if (!selectedElement) return;
    setTextValue(val);
    selectedElement.textContent = val;
    onChange();
  };

  return (
    <div className="card shadow-sm border-0 fade-in my-2" style={{ borderRadius: 12, background: '#ffffff' }}>
      
      {/* Top Action Bar */}
      <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between flex-wrap gap-2" style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold">
            <i className="fas fa-sliders me-1" /> Chỉnh sửa đối tượng (Visual)
          </button>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={onSyncTikz}>
            <i className="fas fa-wand-magic-sparkles me-1" /> Sửa bằng AI Gemini
          </button>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={onRestore} title="Khôi phục lại hình gốc">
          <i className="fas fa-rotate-left me-1" /> Khôi phục gốc
        </button>
      </div>

      <div className="card-body p-3">
        
        {/* Dropdown Selector Row */}
        <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <span className="fw-bold text-muted" style={{ fontSize: '0.85rem' }}>Chọn đối tượng:</span>
          <select 
            className="form-select form-select-sm flex-grow-1"
            value={selectedElement ? elementsList.findIndex(e => e.element === selectedElement) : -1}
            onChange={(e) => {
              const idx = parseInt(e.target.value);
              if (idx >= 0 && elementsList[idx]) {
                onSelectElement(elementsList[idx].element);
              } else {
                onSelectElement(null);
              }
            }}
            style={{ maxWidth: 320 }}
          >
            <option value={-1}>-- Chọn một đối tượng từ danh sách hoặc click trên hình --</option>
            {elementsList.map((item, idx) => (
              <option key={idx} value={idx}>{item.label}</option>
            ))}
          </select>

          {onAddText && (
            <button className="btn btn-outline-primary btn-sm" onClick={onAddText}>
              + + Nhãn chữ
            </button>
          )}
          {onAddLine && (
            <button className="btn btn-outline-primary btn-sm" onClick={onAddLine}>
              + + Nét thẳng
            </button>
          )}
        </div>

        {!selectedElement ? (
          <div className="card p-4 text-center border-dashed bg-light my-2" style={{ borderRadius: 10 }}>
            <i className="fas fa-hand-pointer fa-2x text-primary opacity-50 mb-2" />
            <h6 className="fw-bold text-dark mb-1">Chưa chọn đối tượng nào</h6>
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              Hãy chọn trong danh sách ở trên hoặc click trực tiếp vào bất kỳ chi tiết nào (đường thẳng, cung tròn, chữ...) trên hình minh hoạ.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            
            {/* Selected Element Header Card */}
            <div className="card p-2 bg-light border d-flex flex-row align-items-center justify-content-between flex-wrap gap-2" style={{ borderRadius: 8 }}>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary fs-6">{`<${selectedElement.tagName.toLowerCase()}>`}</span>
                <span className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                  {selectedElement.tagName.toLowerCase() === 'path' ? 'Đối tượng hình học / Cung tròn' : selectedElement.tagName.toLowerCase() === 'text' ? 'Nhãn chữ' : 'Đối tượng hình học'}
                </span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-white border btn-sm text-muted" onClick={handleResetDefault} title="Đặt lại vị trí ban đầu">
                  <i className="fas fa-undo me-1" /> Mặc định
                </button>
                <button className="btn btn-white border btn-sm text-muted" onClick={handleDuplicate} title="Nhân bản đối tượng này">
                  <i className="fas fa-copy me-1" /> Bản sao
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={handleDelete} title="Xoá đối tượng">
                  <i className="fas fa-trash me-1" /> Xoá
                </button>
              </div>
            </div>

            {/* If Text: Edit text content */}
            {(selectedElement.tagName.toLowerCase() === 'text' || selectedElement.tagName.toLowerCase() === 'tspan') && (
              <div className="card p-3 bg-light border" style={{ borderRadius: 8 }}>
                <label className="fw-bold mb-1 text-dark" style={{ fontSize: '0.85rem' }}>
                  <i className="fas fa-font me-1 text-primary" /> Sửa nội dung văn bản:
                </label>
                <input 
                  type="text" 
                  className="form-control form-control-sm" 
                  value={textValue} 
                  onChange={(e) => handleUpdateText(e.target.value)} 
                  placeholder="Nhập nội dung mới..."
                />
              </div>
            )}

            {/* Section 1: Di chuyển vị trí */}
            <div className="card p-3 bg-light border" style={{ borderRadius: 8 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                  <i className="fas fa-up-down-left-right me-1 text-primary" /> Di chuyển vị trí (Phím mũi tên ↑ ↓ ← →)
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Bấm nút hoặc dùng bàn phím</span>
              </div>
              
              <div className="d-flex align-items-center gap-4 flex-wrap">
                {/* Arrow D-Pad */}
                <div className="d-flex flex-column align-items-center">
                  <button className="btn btn-white border btn-sm p-2 lh-1 shadow-sm mb-1" onClick={() => nudge(0, -step)} title="Lên">
                    <i className="fas fa-chevron-up" />
                  </button>
                  <div className="d-flex gap-2 align-items-center">
                    <button className="btn btn-white border btn-sm p-2 lh-1 shadow-sm" onClick={() => nudge(-step, 0)} title="Trái">
                      <i className="fas fa-chevron-left" />
                    </button>
                    <span className="badge bg-primary px-2 py-1" style={{ fontSize: '0.75rem' }}>{step}px</span>
                    <button className="btn btn-white border btn-sm p-2 lh-1 shadow-sm" onClick={() => nudge(step, 0)} title="Phải">
                      <i className="fas fa-chevron-right" />
                    </button>
                  </div>
                  <button className="btn btn-white border btn-sm p-2 lh-1 shadow-sm mt-1" onClick={() => nudge(0, step)} title="Xuống">
                    <i className="fas fa-chevron-down" />
                  </button>
                </div>

                {/* Step Size Selector */}
                <div className="d-flex flex-column gap-2 flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Bước nhảy hiện tại: <b>{step}px</b></span>
                  </div>
                  <div className="d-flex gap-2">
                    {[1, 5, 10, 25].map(val => (
                      <button 
                         key={val} 
                         className={`btn btn-sm ${step === val ? 'btn-primary' : 'btn-outline-secondary'} px-3`}
                         onClick={() => setStep(val)}
                      >
                        {val}px
                      </button>
                    ))}
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    <i className="fas fa-lightbulb me-1 text-warning" />
                    Mẹo: Mở chế độ chỉnh sửa, chọn đối tượng và dùng các phím ↑ ↓ ← → trên bàn phím để dịch chuyển cực nhanh.
                  </small>
                </div>
              </div>
            </div>

            {/* Section 2: Kích thước, Co / Kéo dài & Thu ngắn */}
            <div className="card p-3 bg-light border" style={{ borderRadius: 8 }}>
              <span className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                <i className="fas fa-expand me-1 text-primary" /> Kích thước, Co / Kéo dài & Thu ngắn đối tượng
              </span>

              {/* Overall Scale */}
              <div className="mb-3">
                <small className="text-muted d-block mb-1" style={{ fontSize: '0.78rem' }}>Tỷ lệ tổng thể (Giữ nguyên hình dạng):</small>
                <div className="d-flex gap-2">
                  <button className="btn btn-white border btn-sm flex-grow-1" onClick={() => handleScaleOverall(0.9)}>
                    <i className="fas fa-minus me-1" /> Thu nhỏ 10%
                  </button>
                  <button className="btn btn-white border btn-sm flex-grow-1" onClick={() => handleScaleOverall(1.1)}>
                    <i className="fas fa-plus me-1" /> Phóng to 10%
                  </button>
                </div>
              </div>

              {/* Axis Stretch (horizontal / vertical) */}
              <div>
                <small className="text-muted d-block mb-1" style={{ fontSize: '0.78rem' }}>Co ngắn / Kéo dài từ tâm đối tượng (Không làm đổi vị trí tâm):</small>
                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <button className="btn btn-white border btn-sm w-100" onClick={() => handleScaleAxis(0.9, 1)}>
                      − Co ngang
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button className="btn btn-white border btn-sm w-100" onClick={() => handleScaleAxis(1.1, 1)}>
                      Kéo ngang +
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button className="btn btn-white border btn-sm w-100" onClick={() => handleScaleAxis(1, 0.9)}>
                      ↑ Co dọc
                    </button>
                  </div>
                  <div className="col-6 col-md-3">
                    <button className="btn btn-white border btn-sm w-100" onClick={() => handleScaleAxis(1, 1.1)}>
                      Kéo dọc ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Độ mờ / Ẩn đối tượng */}
            <div className="card p-3 bg-light border" style={{ borderRadius: 8 }}>
              <span className="fw-bold text-dark mb-2" style={{ fontSize: '0.85rem' }}>
                <i className="fas fa-eye me-1 text-primary" /> Độ mờ / Ẩn đối tượng (Làm mờ/Ẩn nét thừa)
              </span>
              <div className="d-flex gap-2 flex-wrap">
                {[
                  { label: 'Rõ (100%)', val: '1' },
                  { label: '75%', val: '0.75' },
                  { label: '50%', val: '0.5' },
                  { label: 'Mờ (20%)', val: '0.2' },
                  { label: 'Ẩn (0%)', val: '0' }
                ].map(item => (
                  <button 
                    key={item.val}
                    className={`btn btn-sm ${opacity === item.val ? 'btn-primary' : 'btn-white border'} flex-grow-1`}
                    onClick={() => handleSetOpacity(item.val)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 4: Màu sắc (Fill / Stroke Color) */}
            <div className="card p-3 bg-light border" style={{ borderRadius: 8 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                  <i className="fas fa-palette me-1 text-primary" /> Màu sắc (Fill / Stroke Color):
                </span>
                <div className="d-flex align-items-center gap-2">
                  <label className="d-flex align-items-center gap-1 cursor-pointer" title="Tuỳ chọn màu viền">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Viền:</span>
                    <input 
                      type="color" 
                      className="form-control form-control-color p-0 border-0" 
                      value={stroke === 'none' ? '#000000' : stroke} 
                      onChange={(e) => {
                        setStroke(e.target.value);
                        selectedElement.setAttribute('stroke', e.target.value);
                        selectedElement.style.stroke = e.target.value;
                        onChange();
                      }} 
                      style={{ width: 24, height: 24 }} 
                    />
                  </label>
                  <label className="d-flex align-items-center gap-1 cursor-pointer" title="Tuỳ chọn màu nền">
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Nền:</span>
                    <input 
                      type="color" 
                      className="form-control form-control-color p-0 border-0" 
                      value={fill === 'none' ? '#ffffff' : fill} 
                      onChange={(e) => {
                        setFill(e.target.value);
                        selectedElement.setAttribute('fill', e.target.value);
                        selectedElement.style.fill = e.target.value;
                        onChange();
                      }} 
                      style={{ width: 24, height: 24 }} 
                    />
                  </label>
                </div>
              </div>

              {/* Preset Palette Swatches */}
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button 
                    key={c}
                    className="btn p-0 rounded-circle border shadow-sm"
                    style={{ width: 26, height: 26, backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : 'none' }}
                    onClick={() => handleApplyColor(c)}
                    title={`Đổi màu thành ${c}`}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
