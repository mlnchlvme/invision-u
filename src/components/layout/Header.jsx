import '../../styles/components/RoleBar.css';
import { useAuth } from '../../context/AuthContext';
import { IconZap, IconLogOut, IconUser } from '../icons';

export default function Header() {
  const { user, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : user?.role === 'applicant' ? 'АБ' : 'КМ';

  const displayName = user?.fullName || (user?.role === 'applicant' ? 'Абитуриент' : 'Комиссия');

  const roleLabel = user?.role === 'applicant' ? 'Абитуриент' : 'Приёмная комиссия';

  return (
    <header className="role-bar">
      <div className="role-bar__logo">
        <div className="role-bar__logo-mark">
          <IconZap size={14} />
        </div>
        <div>
          <div className="role-bar__logo-text">
            inVision U<span className="role-bar__logo-dot" />
          </div>
          <div className="role-bar__logo-sub">{roleLabel}</div>
        </div>
      </div>

      <div className="role-bar__user flex items-center gap-8">
        <span className="role-bar__user-dot">
          {initials.length ? initials : <IconUser size={14} />}
        </span>
        <span className="role-bar__user-name">{displayName}</span>
        <button className="btn-logout" onClick={logout} title="Выйти">
          <IconLogOut size={15} />
        </button>
      </div>
    </header>
  );
}
