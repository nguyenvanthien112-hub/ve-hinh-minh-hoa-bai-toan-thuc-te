import { useMemo } from 'react';
import { getLicenseStatus } from '../lib/license';

interface Props {
  keyCount: number;
  railHidden: boolean;
  refreshKey?: number;
  onToggleRail: () => void;
  onOpenGuide: () => void;
  onOpenLicense: () => void;
  onOpenAdminKeygen: () => void;
}

export default function Header({ keyCount, railHidden, refreshKey, onToggleRail, onOpenGuide, onOpenLicense, onOpenAdminKeygen }: Props) {
  const license = useMemo(() => getLicenseStatus(), [refreshKey]);

  return (
    <nav className="navbar navbar-dark sticky-top py-2">
      <div className="container-fluid px-3 px-lg-4 d-flex flex-wrap gap-2 align-items-center">
        <div className="me-auto">
          <span 
            className="navbar-brand mb-0 cursor-pointer" 
            title="Nhấp đúp để mở công cụ Admin (Nguyễn Thiện)"
            onDoubleClick={onOpenAdminKeygen}
          >
            <i className="fas fa-shapes me-1" />
            Math Visualizer 2.0
          </span>
          <div className="navbar-sub">
            Minh hoạ Toán · Lý · Hoá · Sinh · Địa bằng SVG · Tác giả:{' '}
            <b 
              className="cursor-pointer text-white text-decoration-underline" 
              onClick={onOpenAdminKeygen}
              title="Click để mở công cụ Admin"
            >
              Nguyễn Thiện
            </b>{' '}
            · <i className="fas fa-comment-dots" />{' '}
            <a href="https://zalo.me/0988250112" target="_blank" rel="noopener noreferrer">
              0988.250.112
            </a>
          </div>
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
