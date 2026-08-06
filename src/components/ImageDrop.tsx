import { useRef, useState } from 'react';
import type { ImagePayload } from '../types';
import type { Notify } from '../lib/ui';

interface Props {
  title: string;
  hint: string;
  icon: string;
  value: ImagePayload | null;
  onChange: (img: ImagePayload | null) => void;
  notify: Notify;
}

export function readImageFile(file: File, notify: Notify): Promise<ImagePayload | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      notify('Chỉ nhận tệp ảnh.', 'err');
      return resolve(null);
    }
    if (file.size > 8 * 1024 * 1024) {
      notify('Ảnh quá lớn (tối đa 8 MB).', 'err');
      return resolve(null);
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      resolve({ mime: file.type, data: url.split(',')[1] ?? '', url });
    };
    reader.onerror = () => {
      notify('Không đọc được tệp ảnh.', 'err');
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageDrop({ title, hint, icon, value, onChange, notify }: Props) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const img = await readImageFile(file, notify);
    if (img) onChange(img);
  };

  return (
    <div
      className={'dropzone' + (over ? ' over' : '')}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void handleFile(e.dataTransfer.files[0]);
      }}
    >
      {value ? (
        <img className="thumb" src={value.url} alt={title} />
      ) : (
        <i className={icon + ' fa-2x text-primary'} style={{ width: 40, textAlign: 'center' }} />
      )}
      <div className="txt">
        <b>{title}</b>
        {hint}
      </div>
      <button className="btn btn-outline-primary btn-sm" onClick={() => input.current?.click()}>
        <i className="fas fa-upload me-1" />
        Chọn
      </button>
      {value && (
        <button className="btn btn-outline-danger btn-sm" onClick={() => onChange(null)} title="Bỏ ảnh">
          <i className="fas fa-xmark" />
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
