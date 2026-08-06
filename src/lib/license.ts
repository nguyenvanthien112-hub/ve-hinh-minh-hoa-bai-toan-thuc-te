export type LicenseType = '1m' | '1y' | '2y' | 'life';

export interface LicenseStatus {
  isActivated: boolean;
  isExpired: boolean;
  packageType: LicenseType | 'trial' | null;
  packageLabel: string;
  daysLeft: number;
  expiryDateStr: string;
  deviceId: string;
}

const LICENSE_STORAGE_KEY = 'mv_license_data';
const TRIAL_START_KEY = 'mv_trial_start';
const DEVICE_ID_KEY = 'mv_device_id';

// Generate or retrieve persistent Device ID (e.g. MV-8392-A71F)
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    const raw = (navigator.userAgent + navigator.language + screen.width + screen.height).replace(/\s+/g, '');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const rand = Math.floor(1000 + Math.random() * 9000);
    const hex1 = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    const hex2 = Math.abs(rand * 31).toString(16).toUpperCase().padStart(4, '0').slice(-4);
    id = `MV-${hex1}-${hex2}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// Secret checksum helper (Salted hash of DeviceId + PackageType)
function generateChecksum(deviceId: string, packageType: LicenseType): string {
  const salt = 'MATH_VISUALIZER_NGUYEN_THIEN_0988250112_SECRET_SALT_2026';
  const str = `${deviceId}_${packageType}_${salt}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

// ADMIN TOOL: Generate activation key for customer
export function generateAdminKey(deviceId: string, packageType: LicenseType): string {
  const cleanId = deviceId.trim().toUpperCase();
  const checksum = generateChecksum(cleanId, packageType);
  const typeCode = packageType.toUpperCase();
  return `LIC-${typeCode}-${cleanId.replace('MV-', '')}-${checksum}`;
}

// VERIFY KEY: Check if a key is valid for this device
export function verifyAndApplyKey(inputKey: string): { success: boolean; message: string } {
  const key = inputKey.trim().toUpperCase();
  const deviceId = getDeviceId();
  
  const match = key.match(/^LIC-(1M|1Y|2Y|LIFE)-([A-Z0-9]{4}-[A-Z0-9]{4})-([A-Z0-9]{6})$/);
  if (!match) {
    return { success: false, message: 'Mã kích hoạt không đúng định dạng.' };
  }

  const [, typeStr, devPart, checksumStr] = match;
  const packageType = typeStr.toLowerCase() as LicenseType;
  const targetDeviceId = `MV-${devPart}`;

  if (targetDeviceId !== deviceId) {
    return { success: false, message: 'Mã kích hoạt này dành cho thiết bị khác (không khớp Mã thiết bị của bạn).' };
  }

  const expectedChecksum = generateChecksum(deviceId, packageType);
  if (checksumStr !== expectedChecksum) {
    return { success: false, message: 'Mã kích hoạt không hợp lệ hoặc đã bị chỉnh sửa.' };
  }

  // Calculate Expiry Date
  let expiryTimestamp: number | null = null;
  const now = Date.now();
  if (packageType === '1m') {
    expiryTimestamp = now + 30 * 24 * 60 * 60 * 1000;
  } else if (packageType === '1y') {
    expiryTimestamp = now + 365 * 24 * 60 * 60 * 1000;
  } else if (packageType === '2y') {
    expiryTimestamp = now + 730 * 24 * 60 * 60 * 1000;
  } else if (packageType === 'life') {
    expiryTimestamp = null; // Lifetime
  }

  const data = {
    key,
    packageType,
    activatedAt: now,
    expiryTimestamp,
  };

  localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(data));
  return { success: true, message: 'Kích hoạt bản quyền PRO thành công!' };
}

// Get current License Status for User
export function getLicenseStatus(): LicenseStatus {
  const deviceId = getDeviceId();
  const now = Date.now();

  // Check if PRO license is activated
  const storedStr = localStorage.getItem(LICENSE_STORAGE_KEY);
  if (storedStr) {
    try {
      const data = JSON.parse(storedStr);
      if (data.packageType === 'life') {
        return {
          isActivated: true,
          isExpired: false,
          packageType: 'life',
          packageLabel: 'Bản quyền Vĩnh Viễn (PRO)',
          daysLeft: 99999,
          expiryDateStr: 'Vĩnh viễn',
          deviceId,
        };
      } else if (data.expiryTimestamp) {
        const msLeft = data.expiryTimestamp - now;
        const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        const isExpired = msLeft <= 0;
        const dateObj = new Date(data.expiryTimestamp);
        const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

        const labels: Record<string, string> = {
          '1m': 'Gói PRO 1 Tháng',
          '1y': 'Gói PRO 1 Năm',
          '2y': 'Gói PRO 2 Năm',
        };

        return {
          isActivated: !isExpired,
          isExpired,
          packageType: data.packageType,
          packageLabel: labels[data.packageType] || 'Bản quyền PRO',
          daysLeft,
          expiryDateStr: dateStr,
          deviceId,
        };
      }
    } catch {
      // Invalid storage format, fallback to trial
    }
  }

  // Trial 3 days check
  let trialStart = parseInt(localStorage.getItem(TRIAL_START_KEY) || '0');
  if (!trialStart) {
    trialStart = now;
    localStorage.setItem(TRIAL_START_KEY, String(trialStart));
  }

  const trialDurationMs = 3 * 24 * 60 * 60 * 1000;
  const trialMsLeft = (trialStart + trialDurationMs) - now;
  const trialDaysLeft = Math.max(0, Math.ceil(trialMsLeft / (1000 * 60 * 60 * 24)));
  const isTrialExpired = trialMsLeft <= 0;

  return {
    isActivated: false,
    isExpired: isTrialExpired,
    packageType: 'trial',
    packageLabel: isTrialExpired ? 'Hết hạn dùng thử (3 ngày)' : `Dùng thử miễn phí (${trialDaysLeft} ngày còn lại)`,
    daysLeft: trialDaysLeft,
    expiryDateStr: isTrialExpired ? 'Đã hết hạn' : `${trialDaysLeft} ngày`,
    deviceId,
  };
}
