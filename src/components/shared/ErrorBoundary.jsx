import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="processing fade-in">
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(234,84,85,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            ⚠
          </div>
          <h2 style={{ color: 'var(--red)' }}>Что-то пошло не так</h2>
          <p className="text-muted" style={{ fontWeight: 500, maxWidth: 340, textAlign: 'center' }}>
            {this.state.error?.message || 'Произошла непредвиденная ошибка'}
          </p>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function NetworkErrorBanner({ onRetry }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'rgba(234,84,85,.08)',
      border: '1.5px solid rgba(234,84,85,.25)',
      borderRadius: 'var(--r)',
      marginBottom: 16,
      gap: 12,
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>
          Сервис временно недоступен
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
          Попробуйте обновить страницу или повторите запрос позже
        </div>
      </div>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ flexShrink: 0 }}>
          Повторить
        </button>
      )}
    </div>
  );
}

export function NoApplicationScreen({ onCreate, creating }) {
  return (
    <div className="processing fade-in">
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--accent)', opacity: 0.15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        📋
      </div>
      <h2>Заявка не найдена</h2>
      <p className="text-muted" style={{ fontWeight: 500, maxWidth: 320, textAlign: 'center' }}>
        Нажмите кнопку ниже, чтобы создать заявку на программу Foundation Year 2026
      </p>
      <button
        className="btn btn-primary"
        onClick={onCreate}
        disabled={creating}
        style={{ marginTop: 8 }}
      >
        {creating ? 'Создание...' : 'Создать заявку'}
      </button>
    </div>
  );
}