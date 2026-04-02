import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/components/Auth.css';
import { IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconZap } from '../components/icons';
import { toast } from '../components/shared/Toast';

export default function AuthPage({ onDone, initialTab = 'login' }) {
  const { login, register, setFullName } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async () => {
    setError('');
    if (!email || !password) { setError('Заполните все поля'); return; }
    if (tab === 'register' && !name) { setError('Введите ваше имя'); return; }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        toast('Добро пожаловать!', 'success');
      } else {
        await register(email, password, name);
        setFullName(name);
        toast('Аккаунт создан. Заявка открыта!', 'success');
      }
      onDone();
    } catch (e) {
      setError(e.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <IconZap size={18} />
          </div>
          <div>
            <div className="auth-logo-text">inVision U</div>
            <div className="auth-logo-sub">Портал абитуриента</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
            Войти
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
            Регистрация
          </button>
        </div>

        {tab === 'register' && (
          <div className="auth-field">
            <label>Полное имя</label>
            <div className="auth-input-wrap">
              <span className="icon-left"><IconUser size={15} /></span>
              <input
                className="auth-input"
                type="text"
                placeholder="Иванов Иван Иванович"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>
          </div>
        )}

        <div className="auth-field">
          <label>Email</label>
          <div className="auth-input-wrap">
            <span className="icon-left"><IconMail size={15} /></span>
            <input
              className="auth-input"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        <div className="auth-field">
          <label>Пароль</label>
          <div className="auth-input-wrap">
            <span className="icon-left"><IconLock size={15} /></span>
            <input
              className="auth-input"
              type={showPwd ? 'text' : 'password'}
              placeholder={tab === 'register' ? 'Минимум 8 символов' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button className="icon-right" onClick={() => setShowPwd(s => !s)} type="button">
              {showPwd ? <IconEyeOff size={15} /> : <IconEye size={15} />}
            </button>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button
          className="btn btn-dark btn-lg auth-submit"
          onClick={submit}
          disabled={loading}
        >
          {loading
            ? <span className="btn-spinner" />
            : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>

        <div className="auth-divider">
          {tab === 'login'
            ? <>Нет аккаунта? <a onClick={() => { setTab('register'); setError(''); }}>Зарегистрироваться</a></>
            : <>Уже есть аккаунт? <a onClick={() => { setTab('login'); setError(''); }}>Войти</a></>
          }
        </div>
      </div>
    </div>
  );
}
