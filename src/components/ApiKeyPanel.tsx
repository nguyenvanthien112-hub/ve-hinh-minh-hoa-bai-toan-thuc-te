import { useState } from 'react';
import Card from './Card';
import { parseKeys, testKeys } from '../lib/gemini';
import { STORAGE_KEYS, store } from '../lib/storage';
import type { Notify } from '../lib/ui';

interface Props {
  value: string;
  onChange: (v: string) => void;
  notify: Notify;
  embedded?: boolean;  // khi true: hiển thị nội dung trực tiếp, không bọc Card
}

export default function ApiKeyPanel({ value, onChange, notify, embedded = false }: Props) {
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const count = parseKeys(value).length;

  const save = () => {
    const keys = parseKeys(value);
    if (!keys.length) {
      notify('Chưa nhận được key hợp lệ. Dán lại key từ Google AI Studio.', 'err');
      return;
    }
    const joined = keys.join('\n');
    onChange(joined);
    store.set(STORAGE_KEYS.keys, joined);
    notify(`Đã lưu ${keys.length} key vào máy bạn.`);
  };

  const clear = () => {
    onChange('');
    store.remove(STORAGE_KEYS.keys);
    notify('Đã xoá key.');
  };

  const check = async () => {
    const keys = parseKeys(value);
    if (!keys.length) {
      notify('Nhập key trước khi kiểm tra.', 'err');
      return;
    }
    setTesting(true);
    const result = await testKeys(keys);
    setTesting(false);
    notify(result.join(' · '), result.some((r) => !r.includes('hoạt động')) ? 'err' : 'ok');
  };

  const content = (
    <>
      <div className="sidebar-label mb-2">
        <i className="fas fa-key me-1 text-primary" /> Gemini API Key
        <span className="badge bg-light text-dark ms-2">{count} key</span>
      </div>
      <div className="key-wrap">
        <textarea
          className={'form-control key-field' + (show ? ' reveal' : '')}
          rows={3}
          value={value}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Dán API key vào đây. Mỗi dòng một key để tự động xoay vòng khi bị giới hạn."
        />
        <button
          className="btn btn-outline-primary btn-sm key-eye"
          onClick={() => setShow((v) => !v)}
          title="Hiện / ẩn key"
          aria-label="Hiện hoặc ẩn key"
        >
          <i className={'fas ' + (show ? 'fa-eye-slash' : 'fa-eye')} />
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-2">
        <button className="btn btn-primary btn-sm" onClick={save}>
          <i className="fas fa-floppy-disk me-1" />
          Lưu key
        </button>
        <button className="btn btn-outline-primary btn-sm" onClick={() => void check()} disabled={testing}>
          <i className={'me-1 fas ' + (testing ? 'fa-spinner fa-spin' : 'fa-plug-circle-check')} />
          {testing ? 'Đang kiểm tra…' : 'Kiểm tra key'}
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={clear}>
          <i className="fas fa-trash me-1" />
          Xoá
        </button>
      </div>

      <p className="text-muted mt-2 mb-0" style={{ fontSize: '.78rem' }}>
        Key lưu trong <b>localStorage</b> trên máy bạn, không gửi đi đâu ngoài Google.{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
          Lấy key miễn phí tại Google AI Studio <i className="fas fa-arrow-up-right-from-square" />
        </a>
      </p>
    </>
  );

  if (embedded) return content;

  return (
    <Card
      title="Gemini API key"
      icon="fas fa-key"
      defaultOpen={count === 0}
      badge={<span className="badge bg-light text-dark">{count} key</span>}
    >
      {content}
    </Card>
  );
}
