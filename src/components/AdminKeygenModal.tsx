import { useState } from 'react';
import { generateAdminKey, LicenseType } from '../lib/license';
import type { Notify } from '../lib/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notify: Notify;
}

export default function AdminKeygenModal({ isOpen, onClose, notify }: Props) {
  const [customerDeviceId, setCustomerDeviceId] = useState('');
  const [packageType, setPackageType] = useState<LicenseType>('1y');
  const [generatedKey, setGeneratedKey] = useState('');

  if (!isOpen) return null;

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

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          
          {/* Admin Header */}
          <div className="modal-header bg-dark text-white p-3 border-bottom border-warning">
            <h5 className="modal-title fw-bold text-warning d-flex align-items-center gap-2">
              <i className="fas fa-user-gear text-warning" />
              Công Cụ Admin Tạo Mã Kích Hoạt (Tác giả Nguyễn Thiện)
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light">
            
            <div className="alert alert-info py-2" style={{ fontSize: '0.85rem' }}>
              <i className="fas fa-circle-info me-1" />
              Đây là công cụ quản trị bảo mật dành riêng cho Admin (Nguyễn Thiện). Dán Mã thiết bị do khách hàng gửi qua Zalo để sinh ra Mã kích hoạt PRO tương ứng.
            </div>

            <form onSubmit={handleGenerate} className="d-flex flex-column gap-3">
              
              {/* Device ID input */}
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

              {/* Package selector */}
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

              {/* Generate Button */}
              <button type="submit" className="btn btn-warning btn-lg fw-bold text-dark mt-2 shadow">
                <i className="fas fa-wand-magic-sparkles me-2" /> Tạo Mã Kích Hoạt Cho Khách Hang
              </button>

            </form>

            {/* Generated Key Result */}
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

          <div className="modal-footer p-3 bg-white">
            <button className="btn btn-secondary btn-sm px-4" onClick={onClose}>
              Đóng
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
