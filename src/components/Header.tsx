interface Props {
  keyCount: number;
  railHidden: boolean;
  onToggleRail: () => void;
  onOpenGuide: () => void;
}

export default function Header({ keyCount, railHidden, onToggleRail, onOpenGuide }: Props) {
  return (
    <nav className="navbar navbar-dark sticky-top py-2">
      <div className="container-fluid px-3 px-lg-4 d-flex flex-wrap gap-2 align-items-center">
        <div className="me-auto">
          <span className="navbar-brand mb-0">
            <i className="fas fa-shapes" />
            Math Visualizer
          </span>
          <div className="navbar-sub">
            Minh hoạ Toán · Lý · Hoá · Sinh · Địa bằng SVG · Tác giả: <b>Nguyễn Thiện</b> ·{' '}
            <i className="fas fa-comment-dots" />{' '}
            <a href="https://zalo.me/0988250112" target="_blank" rel="noopener noreferrer">
              0988.250.112
            </a>
          </div>
        </div>

        <span className={'badge px-3 py-2 ' + (keyCount ? 'bg-success' : 'bg-warning text-dark')}>
          <i className={'fas ' + (keyCount ? 'fa-circle-check' : 'fa-triangle-exclamation')} />{' '}
          {keyCount ? `Sẵn sàng · ${keyCount} key` : 'Chưa có API key'}
        </span>
        <button className="btn btn-glass btn-sm" onClick={onOpenGuide}>
          <i className="fas fa-circle-info me-1" />
          Hướng dẫn
        </button>
        <button className="btn btn-glass btn-sm" onClick={onToggleRail}>
          <i className={'fas me-1 ' + (railHidden ? 'fa-chevron-right' : 'fa-chevron-left')} />
          {railHidden ? 'Hiện khung nhập' : 'Ẩn khung nhập'}
        </button>
      </div>
    </nav>
  );
}
