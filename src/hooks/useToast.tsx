import { useCallback, useRef, useState } from 'react';
import type { ToastItem } from '../types';

export function useToast() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    const id = ++seq.current;
    setItems((list) => [...list, { id, msg, type }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 3600);
  }, []);

  const view = (
    <div id="toast" className={items.length ? 'on' : ''}>
      {items.map((t) => (
        <div key={t.id} className={'toast' + (t.type === 'err' ? ' err' : '')}>
          {t.msg}
        </div>
      ))}
    </div>
  );

  return { notify, view };
}
