import type { StyleDef, StyleId } from '../types';

export const STYLES: Record<StyleId, StyleDef> = {
  sgk: {
    name: 'SGK chuẩn',
    desc: 'Trực quan, sinh động, nhiều màu',
    dot: '#0f766e',
    spec:
      'Nền trắng. Nét chính xanh đậm #1e3a8a dày 2.5, nét phụ và đường kẻ phụ nét đứt xám #94a3b8. ' +
      'Tô vùng bằng màu nhạt trong suốt (fill-opacity 0.15). Nhãn dữ kiện màu đỏ #dc2626, nhãn đỉnh màu đen. ' +
      'Phong cách sách giáo khoa Việt Nam hiện hành.',
  },
  bw: {
    name: 'Đen trắng / in ấn',
    desc: 'Nét đen nền trắng, tiết kiệm mực',
    dot: '#111827',
    spec:
      'Chỉ dùng đen #000000 và các sắc xám. Nền trắng tinh. Không tô màu, phân biệt vùng bằng nét gạch chéo ' +
      '(pattern) hoặc nét đứt. Tối ưu để in đề kiểm tra trắng đen.',
  },
  board: {
    name: 'Bảng phấn',
    desc: 'Nền xanh lục đậm, nét phấn trắng',
    dot: '#065f46',
    spec:
      'Nền bảng xanh lục đậm #0d3b30 phủ kín viewBox. Nét vẽ trắng ngà #f8fafc dày 2.5, nhãn màu vàng phấn ' +
      '#fde68a và hồng phấn #fbcfe8. Cảm giác viết phấn trên bảng.',
  },
  minimal: {
    name: 'Tối giản',
    desc: 'Thuần đường nét hình học',
    dot: '#4f46e5',
    spec:
      'Nền trắng, chỉ một màu mực chàm #312e81 với hai độ dày nét. Không tô vùng, không đổ bóng, không trang trí. ' +
      'Chữ nhỏ gọn, khoảng trắng rộng.',
  },
  classic: {
    name: 'Sách cổ điển',
    desc: 'Nền giấy kem, nét nâu',
    dot: '#92400e',
    spec:
      'Nền giấy kem #f5efe0 phủ kín viewBox. Nét nâu sẫm #4a3418, nhãn nâu đỏ #7c2d12, đường phụ mảnh. ' +
      'Phong cách khắc gỗ sách toán cổ.',
  },
};

export const STYLE_IDS = Object.keys(STYLES) as StyleId[];
