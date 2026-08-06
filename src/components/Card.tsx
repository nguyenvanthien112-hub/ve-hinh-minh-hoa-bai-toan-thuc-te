import { useState, type ReactNode } from 'react';

interface Props {
  title: string;
  icon: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, icon, badge, defaultOpen = true, className = '', children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`card fade-in ${className}`}>
      <div className={'card-header' + (open ? '' : ' collapsed')} onClick={() => setOpen((v) => !v)}>
        <i className={icon} />
        <span>{title}</span>
        {badge}
        <i className="fas fa-chevron-down chev" />
      </div>
      {open && <div className="card-body">{children}</div>}
    </div>
  );
}
