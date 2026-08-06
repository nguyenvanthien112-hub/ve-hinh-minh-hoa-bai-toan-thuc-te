import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} onCancel={onClose}>
      <header>
        <h2>{title}</h2>
        <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={onClose}>
          Đóng
        </button>
      </header>
      <div className="content">{children}</div>
    </dialog>
  );
}
