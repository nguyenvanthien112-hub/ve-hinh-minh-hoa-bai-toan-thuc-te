import { useState } from 'react';
import { generateAdminKey, LicenseType } from '../lib/license';
import type { Notify } from '../lib/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notify: Notify;
}

// Master Admin Password (Admin Nguyễn Thiện set)
const ADMIN_MASTER_PASS = 'thien0988';

export default function AdminKeygenModal({ isOpen, onClose, notify }: Props) {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerDeviceId, setCustomerDeviceId] = useState('');
  const [packageType, setPackageType] = useState<LicenseType>('1y');
  const [generatedKey, setGeneratedKey] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_MASTER_PASS) {
      setIsAuthenticated(true);
      notify('Đăng nhập Quản trị viên Admin thành công!');
    } else {
      notify('Mật khẩu Admin không đúng!', 'err');
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDeviceId.trim()) {
      notify('Vui lòng nhập Mã thiết bị của khách hàng.', 'err');
      return;
    }

    const cleanDevId = customerDeviceId.trim().toUpperCase();
    if (!cleanDevId.startsWith('MV-')) {
      notify('Mã thiết bị phải có định dạng bắt đầu bằng MV- (ví dụ: MV-8392-A71F).', 'err');
      return;
    }

    const key = generateAdminKey(cleanDevId, packageType);
    setGeneratedKey(key);
    notify('Đã tạo Mã kích hoạt thành công!');
  };

  const handleCopyGeneratedKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    notify(`Đã sao chép Mã kích hoạt (${generatedKey})! Hãy dán gửi Zalo cho khách hàng.`);
  };

  const handleClose = () => {
    setPasswordInput('');
    setIsAuthenticated(false);
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          
          {/* Admin Header */}
          <div className="modal-header bg-dark text-white p-3 border-bottom border-warning">
            <h5 className="modal-title fw-bold text-warning d-flex align-items-center gap-2">
              <i className="fas fa-lock text-warning" />
              Công Cụ Bảo Mật Admin (Tác giả Nguyễn Thiện)
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            
            {!isAuthenticated ? (
              /* Step 1: Admin Password Protection */
              <div className="card p-4 border-0 shadow-sm mx-auto" style={{ maxWidth: 450, borderRadius: 12 }}>
                <div className="text-center mb-3">
                  <div className="avatar-icon bg-warning bg-opacity-20 text-dark rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2" style={{ width: 60, height: 60 }}>
                    <i className="fas fa-key fs-3 text-warning" />
                  </div>
                  <h5 className="fw-bold text-dark mb-1">Xác Thực Mật Khẩu Admin</h5>
                  <p className="text-muted" style={{ fontSize: '0.83rem' }}>
                    Vui lòng nhập Mật khẩu Quản trị để mở Trình tạo mã kích hoạt.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small fw-bold text-muted">Mật khẩu Admin:</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg text-center" 
                      placeholder="Nhập mật khẩu..." 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)} 
                      autoFocus 
                    />
                  </div>
                  <button type="submit" className="btn btn-warning btn-lg fw-bold text-dark shadow-sm">
                    <i className="fas fa-right-to-bracket me-2" /> Đăng nhập Admin
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: Admin Key Generator Tool */
              <div>
                <div className="alert alert-success py-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.85rem' }}>
                  <span><i className="fas fa-shield-check me-1 text-success" /> Đã xác thực quyền Admin Nguyễn Thiện.</span>
                  <button className="btn btn-sm btn-outline-danger py-0" onClick={() => setIsAuthenticated(false)}>Đăng xuất Admin</button>
                </div>

                <form onSubmit={handleGenerate} className="d-flex flex-column gap-3">
                  <div>
                    <label className="fw-bold mb-1 text-dark" style={{ fontSize: '0.88rem' }}>
                      1. Dán Mã thiết bị của Khách hàng (do khách gửi qua Zalo):
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg text-uppercase fw-bold" 
                      placeholder="Ví dụ: MV-8392-A71F" 
                      value={customerDeviceId} 
                      onChange={(e) => setCustomerDeviceId(e.target.value)} 
                      style={{ letterSpacing: 1 }}
                    />
                  </div>

                  <div>
                    <label className="fw-bold mb-1 text-dark" style={{ fontSize: '0.88rem' }}>
                      2. Chọn gói thời hạn kích hoạt:
                    </label>
                    <div className="row g-2">
                      {[
                        { id: '1m', label: '1 Tháng (30 ngày)', icon: 'fa-calendar-day' },
                        { id: '1y', label: '1 Năm (365 ngày)', icon: 'fa-calendar-days' },
                        { id: '2y', label: '2 Năm (730 ngày)', icon: 'fa-calendar-range' },
                        { id: 'life', label: 'Vĩnh Viễn (PRO)', icon: 'fa-infinity' },
                      ].map(pkg => (
                        <div key={pkg.id} className="col-6 col-md-3">
                          <button 
                             type="button"
                             className={`btn w-100 py-2 d-flex flex-column align-items-center gap-1 ${packageType === pkg.id ? 'btn-primary shadow-sm fw-bold' : 'btn-outline-secondary bg-white'}`}
                             onClick={() => setPackageType(pkg.id as LicenseType)}
                          >
                            <i className={`fas ${pkg.icon} fs-5`} />
                            <span style={{ fontSize: '0.8rem' }}>{pkg.label}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-warning btn-lg fw-bold text-dark mt-2 shadow">
                    <i className="fas fa-wand-magic-sparkles me-2" /> Tạo Mã Kích Hoạt Cho Khách Hàng
                  </button>
                </form>

                {generatedKey && (
                  <div className="card p-3 mt-4 border-success bg-success bg-opacity-10" style={{ borderRadius: 10 }}>
                    <span className="fw-bold text-success mb-2 d-block" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-circle-check me-1" /> Kết quả Mã kích hoạt đã tạo:
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <input 
                        type="text" 
                        className="form-control form-control-lg text-uppercase fw-bold text-center bg-white text-success border-success" 
                        value={generatedKey} 
                        readOnly 
                        style={{ letterSpacing: 1.5, fontSize: '1.1rem' }} 
                      />
                      <button className="btn btn-success btn-lg px-4 text-nowrap fw-bold shadow" onClick={handleCopyGeneratedKey}>
                        <i className="fas fa-copy me-1" /> Copy gửi Zalo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          <div className="modal-footer p-3 bg-white">
            <button className="btn btn-secondary btn-sm px-4" onClick={handleClose}>
              Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
