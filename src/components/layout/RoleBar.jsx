import '../../styles/components/RoleBar.css';

export default function RoleBar({ role, setRole, setPage }) {
  const initial = role === 'candidate' ? 'АС' : 'МП';
  const name    = role === 'candidate' ? 'Айдана Сейткали' : 'Мария Петрова';

  return (
    <header className="role-bar">
      {/* Logo */}
      <div className="role-bar__logo">
        <div>
          <div className="role-bar__logo-text">
            inVision U<span className="role-bar__logo-dot" />
          </div>
          <div className="role-bar__logo-sub">Портал приёмной комиссии</div>
        </div>
      </div>

      {/* Role toggle */}
      <div className="role-bar__toggle">
        <button
          className={role === 'candidate' ? 'active' : ''}
          onClick={() => { setRole('candidate'); setPage('status'); }}
        >
          Абитуриент
        </button>
        <button
          className={role === 'commission' ? 'active' : ''}
          onClick={() => { setRole('commission'); setPage('dashboard'); }}
        >
          Комиссия
        </button>
      </div>

      {/* User */}
      <div className="role-bar__user flex items-center gap-8">
        <span className="role-bar__user-dot">{initial}</span>
        <span className="role-bar__user-name">{name}</span>
      </div>
    </header>
  );
}
