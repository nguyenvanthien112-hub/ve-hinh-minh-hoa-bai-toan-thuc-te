/** Bọc localStorage an toàn: nếu trình duyệt chặn thì lưu tạm trong RAM. */
const memory: Record<string, string> = {};

export const storageAvailable: boolean = (() => {
  try {
    localStorage.setItem('__mv', '1');
    localStorage.removeItem('__mv');
    return true;
  } catch {
    return false;
  }
})();

export const store = {
  get(key: string): string | null {
    try {
      return storageAvailable ? localStorage.getItem(key) : key in memory ? memory[key] : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (storageAvailable) localStorage.setItem(key, value);
      else memory[key] = value;
    } catch {
      memory[key] = value;
    }
  },
  remove(key: string): void {
    try {
      if (storageAvailable) localStorage.removeItem(key);
      else delete memory[key];
    } catch {
      /* bỏ qua */
    }
  },
};

export const STORAGE_KEYS = {
  keys: 'mv.keys',
  style: 'mv.style',
  subject: 'mv.subject',
  model: 'mv.model',
  history: 'mv.history',
  grid: 'mv.grid',
  options: 'mv.options',
} as const;
