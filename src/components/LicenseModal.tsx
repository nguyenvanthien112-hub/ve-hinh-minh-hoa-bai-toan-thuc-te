import { useState } from 'react';
import { getLicenseStatus, verifyAndApplyKey, LicenseStatus } from '../lib/license';
import type { Notify } from '../lib/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notify: Notify;
  onLicenseChanged: () => void;
}

export default function LicenseModal({ isOpen, onClose, notify, onLicenseChanged }: Props) {
  const [inputKey, setInputKey] = useState('');
  const status: LicenseStatus = getLicenseStatus();

  if (!isOpen) return null;

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(status.deviceId);
    notify(`Đã sao chép Mã thiết bị (${status.deviceId})! Hãy dán gửi Zalo cho Admin Nguyễn Thiện.`);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      notify('Vui lòng nhập Mã kích hoạt.', 'err');
      return;
    }

    const res = verifyAndApplyKey(inputKey);
    if (res.success) {
      notify(res.message);
      setInputKey('');
      onLicenseChanged();
    } else {
      notify(res.message, 'err');
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="modal-header bg-gradient text-white p-3" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="fas fa-shield-halved" />
              Bản Quyền & Kích Hoạt Phần Mềm
            </h5>
            {!status.isExpired && (
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            )}
          </div>

          <div className="modal-body p-4 bg-light">
            
            {/* Status Banner */}
            <div className={`card p-3 mb-4 border-0 shadow-sm ${status.isActivated ? 'bg-success bg-opacity-10 border-start border-success border-4' : status.isExpired ? 'bg-danger bg-opacity-10 border-start border-danger border-4' : 'bg-warning bg-opacity-10 border-start border-warning border-4'}`}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <i className={`fas ${status.isActivated ? 'fa-certificate text-success' : status.isExpired ? 'fa-lock text-danger' : 'fa-clock text-warning'}`} />
                    Trạng thái: <span className={status.isActivated ? 'text-success' : status.isExpired ? 'text-danger' : 'text-dark'}>{status.packageLabel}</span>
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                    {status.isActivated ? `Hạn sử dụng đến: ${status.expiryDateStr}` : status.isExpired ? 'Ứng dụng đã hết hạn dùng thử. Vui lòng kích hoạt bản quyền PRO để tiếp tục.' : `Bạn đang dùng thử miễn phí 3 ngày. Hạn dùng thử còn: ${status.daysLeft} ngày.`}
                  </p>
                </div>
                <span className={`badge fs-6 px-3 py-2 ${status.isActivated ? 'bg-success' : status.isExpired ? 'bg-danger' : 'bg-warning text-dark'}`}>
                  {status.isActivated ? 'PRO REGISTERED' : status.isExpired ? 'HẾT HẠN' : 'FREE TRIAL'}
                </span>
              </div>
            </div>

            {/* Step 1: Copy Device ID */}
            <div className="card p-3 mb-3 bg-white border" style={{ borderRadius: 10 }}>
              <h6 className="fw-bold text-primary mb-2" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-1 me-2" /> Bước 1: Sao chép Mã thiết bị của bạn
              </h6>
              <p className="text-muted mb-2" style={{ fontSize: '0.83rem' }}>
                Gửi <b>Mã thiết bị</b> bên dưới qua Zalo cho Admin (Tác giả <b>Nguyễn Thiện</b>) để nhận <b>Mã kích hoạt PRO</b> (1 tháng, 1 năm, 2 năm hoặc Vĩnh viễn).
              </p>

              <div className="d-flex align-items-center gap-2">
                <input 
                  type="text" 
                  className="form-control form-control-sm fw-bold text-center bg-light" 
                  value={status.deviceId} 
                  readOnly 
                  style={{ letterSpacing: 1, fontSize: '0.95rem' }} 
                />
                <button className="btn btn-primary btn-sm px-3 text-nowrap" onClick={handleCopyDeviceId}>
                  <i className="fas fa-copy me-1" /> Sao chép gửi Zalo
                </button>
              </div>

              <div className="mt-2 d-flex align-items-center gap-2" style={{ fontSize: '0.82rem' }}>
                <i className="fas fa-headset text-success" />
                <span>Zalo Admin: <a href="https://zalo.me/0988250112" target="_blank" rel="noopener noreferrer" className="fw-bold text-decoration-none">0988.250.112 (Nguyễn Thiện)</a></span>
              </div>
            </div>

            {/* Step 2: Enter License Key */}
            <div className="card p-3 bg-white border" style={{ borderRadius: 10 }}>
              <h6 className="fw-bold text-primary mb-2" style={{ fontSize: '0.9rem' }}>
                <i className="fas fa-2 me-2" /> Bước 2: Nhập Mã kích hoạt từ Admin
              </h6>
              <form onSubmit={handleActivate} className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control form-control-sm text-uppercase" 
                  placeholder="Ví dụ: LIC-1Y-8392-B9X2-901F" 
                  value={inputKey} 
                  onChange={(e) => setInputKey(e.target.value)} 
                />
                <button type="submit" className="btn btn-success btn-sm px-4 text-nowrap fw-bold">
                  <i className="fas fa-key me-1" /> Kích hoạt ngay
                </button>
              </form>
            </div>

            {/* Legal / Copyright Footer info */}
            <div className="mt-4 p-3 bg-white border rounded text-muted" style={{ fontSize: '0.78rem' }}>
              <div className="fw-bold text-dark mb-1">
                <i className="fas fa-copyright me-1 text-primary" /> THÔNG TIN BẢN QUYỀN & SỞ HỮU TRÍ TUỆ
              </div>
              <div>• Phần mềm <b>Math Visualizer 2.0</b> - Tác giả & Chủ sở hữu: <b>Nguyễn Thiện</b>.</div>
              <div>• Mọi hành vi sao chép, crack, thương mại hoá mã nguồn mà không được sự đồng ý bằng văn bản của tác giả đều là vi phạm pháp luật sở hữu trí tuệ.</div>
            </div>

          </div>

          <div className="modal-footer p-3 bg-white d-flex justify-content-between">
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
              <i className="fas fa-phone me-1 text-success" /> Hỗ trợ nhanh: <b>0988.250.112</b>
            </span>
            {!status.isExpired && (
              <button className="btn btn-secondary btn-sm px-4" onClick={onClose}>
                Đóng
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
