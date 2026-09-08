import { useMemo } from 'react';
import { getLicenseStatus } from '../lib/license';
import { MODELS, type ModelChoice } from '../lib/gemini';

interface Props {
  keyCount: number;
  railHidden: boolean;
  refreshKey?: number;
  modelChoice: ModelChoice;
  setModelChoice: (v: ModelChoice) => void;
  onToggleRail: () => void;
  onOpenGuide: () => void;
  onOpenLicense: () => void;
  onOpenAdminKeygen: () => void;
}

const MODEL_SHORT: Record<string, string> = {
  auto: 'Tự động (3 model)',
  'gemini-3.5-flash': 'Flash 3.5',
  'gemini-3.5-flash-lite': 'Flash Lite',
  'gemini-3.6-flash': 'Flash 3.6',
};

export default function Header({ keyCount, railHidden, refreshKey, modelChoice, setModelChoice, onToggleRail, onOpenGuide, onOpenLicense, onOpenAdminKeygen }: Props) {
  const license = useMemo(() => getLicenseStatus(), [refreshKey]);

  return (
    <nav className="navbar navbar-dark sticky-top py-2">
      <div className="container-fluid px-3 px-lg-4 d-flex flex-wrap gap-2 align-items-center">
        <div className="me-auto">
          <span
            className="navbar-brand mb-0"
            onDoubleClick={onOpenAdminKeygen}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
              <polygon points="14,2 26,24 2,24" fill="white" opacity="0.95"/>
              <circle cx="6" cy="22" r="3.5" fill="white" opacity="0.7"/>
              <circle cx="22" cy="22" r="5" fill="white" opacity="0.5"/>
            </svg>
            Vẽ Hình Minh Hoạ Toán Thực Tế 5.0
          </span>
          <div className="navbar-sub">
            Toán · Lý · Hoá · Sinh · Địa | Tiểu học – THCS – THPT · Tác giả: <b>Nguyễn Thiện</b> ·{' '}
            <i className="fas fa-comment-dots" />{' '}
            <a href="https://zalo.me/0988250112" target="_blank" rel="noopener noreferrer">
              0988.250.112
            </a>
          </div>
        </div>

        {/* Model Selector — compact */}
        <div className="d-flex align-items-center gap-1">
          <i className="fas fa-microchip text-white opacity-75" style={{ fontSize: '.8rem' }} />
          <select
            className="form-select form-select-sm header-model-select"
            value={modelChoice}
            onChange={(e) => setModelChoice(e.target.value as ModelChoice)}
            title="Chọn Model AI"
          >
            <option value="auto">{MODEL_SHORT['auto']}</option>
            {MODELS.map((m) => (
              <option key={m} value={m}>{MODEL_SHORT[m]}</option>
            ))}
          </select>
        </div>

        {/* License Badge */}
        <button
          className={`btn btn-sm cursor-pointer border-0 ${license.isActivated ? 'btn-success' : license.isExpired ? 'btn-danger animate-pulse' : 'btn-warning text-dark'}`}
          onClick={onOpenLicense}
          title="Xem thông tin bản quyền & kích hoạt"
        >
          <i className={`fas ${license.isActivated ? 'fa-shield-check me-1' : license.isExpired ? 'fa-lock me-1' : 'fa-clock me-1'}`} />
          {license.isActivated ? (license.packageType === 'life' ? 'PRO Vĩnh Viễn' : `PRO (${license.daysLeft} ngày)`) : license.isExpired ? 'Hết hạn - Kích hoạt ngay' : `Dùng thử (${license.daysLeft} ngày)`}
        </button>

        {/* API Key Count Badge */}
        <span className={'badge px-3 py-2 ' + (keyCount ? 'bg-success' : 'bg-warning text-dark')}>
          <i className={'fas ' + (keyCount ? 'fa-circle-check' : 'fa-triangle-exclamation')} />{' '}
          {keyCount ? `Sẵn sàng · ${keyCount} key` : 'Chưa có API key'}
        </span>

        <button className="btn btn-glass btn-sm" onClick={onOpenGuide}>
          <i className="fas fa-circle-info me-1" />
          Hướng dẫn
        </button>
        <button className="btn btn-glass btn-sm" onClick={onToggleRail}>
          <i className={'fas me-1 ' + (railHidden ? 'fa-chevron-right' : 'fa-chevron-left')} />
          {railHidden ? 'Hiện khung nhập' : 'Ẩn khung nhập'}
        </button>
      </div>
    </nav>
  );
}
