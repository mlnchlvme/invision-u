import { useState, useEffect, useRef } from 'react';
import '../../styles/components/Video.css';
import StatusBadge from '../shared/StatusBadge';
import { applicationsApi } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { IconCheck, IconCelebrate } from '../icons';

const MAX_SIZE_BYTES = 500 * 1024 * 1024;
const ALLOWED_TYPES  = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

const TIPS = [
  'Говорите чётко и уверенно, смотрите в камеру',
  'Расскажите о вашей мотивации и целях поступления',
  'Упомяните ключевые достижения из школьного опыта',
  'Ответьте: почему именно inVision U? Что вас вдохновляет?',
  'Длительность: 2–3 минуты. Краткость ценится.',
];

export default function CandidateVideo() {
  const { user }  = useAuth();
  const fileInput = useRef(null);

  const [phase, setPhase]           = useState('select');   // select | uploading | done | error
  const [questionId, setQuestionId] = useState('V1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError]   = useState('');
  const [uploadPct, setUploadPct]   = useState(0);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (user?.appId) {
      applicationsApi.getVideoQs(user.appId)
        .then(data => {
          if (data?.questions?.length) setQuestionId(data.questions[0]);
        })
        .catch(() => {});
    }
  }, [user?.appId]);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Допустимые форматы: MP4, WebM, MOV, AVI.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `Файл слишком большой (${(file.size / 1024 / 1024).toFixed(0)} МБ). Максимум — 500 МБ.`;
    }
    return '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      setSelectedFile(null);
      return;
    }
    setFileError('');
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    setFileError('');
    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile || !user?.appId) return;

    const cdnUrl = import.meta.env.VITE_CDN_UPLOAD_URL;
    if (!cdnUrl) {
      setFileError('VITE_CDN_UPLOAD_URL не задан. Укажите эндпоинт CDN в .env');
      return;
    }

    setSaving(true);
    setPhase('uploading');
    setUploadPct(0);

    try {
      const videoUrl = await new Promise((resolve, reject) => {
        const xhr  = new XMLHttpRequest();
        const form = new FormData();
        form.append('file', selectedFile);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadPct(Math.round((e.loaded / e.total) * 90)); // до 90% — загрузка на CDN
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve(json.url || json.video_url || json.file_url);
            } catch {
              reject(new Error('CDN вернул неожиданный ответ'));
            }
          } else {
            reject(new Error(`CDN ошибка: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Ошибка сети при загрузке на CDN'));

        xhr.open('POST', cdnUrl);
        xhr.send(form);
      });

      if (!videoUrl) throw new Error('CDN не вернул URL файла');

      setUploadPct(95);

      await applicationsApi.updateVideo(user.appId, {
        question_id: questionId || 'V1',
        video_url:   videoUrl,
      });

      setUploadPct(100);
      setTimeout(() => setPhase('done'), 500);
    } catch (err) {
      setFileError(err.message || 'Ошибка загрузки. Попробуйте ещё раз.');
      setPhase('select');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setFileError('');
    setUploadPct(0);
    setPhase('select');
    if (fileInput.current) fileInput.current.value = '';
  };

  const fmt = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
    return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
  };

  return (
    <>
      <div className="page-header">
        <h1>Видео-представление</h1>
        <p>Расскажите о себе за 2–3 минуты на русском или английском языке</p>
      </div>

      <div className="content fade-in">
        {phase === 'select' && (
          <div className="video-stage">
            <h3>Загрузите видео-файл</h3>
            <p className="text-muted" style={{ marginBottom: 18, fontSize: 13, fontWeight: 500 }}>
              Запишите видео заранее (MP4, WebM, MOV, AVI · до 500 МБ · 2–3 минуты)
            </p>

            <div
              className="video-preview"
              style={{
                border: `2px dashed ${selectedFile ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'border-color .2s',
                flexDirection: 'column',
                gap: 10,
              }}
              onClick={() => fileInput.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <>
                  <span style={{ fontSize: 36 }}>🎬</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{selectedFile.name}</span>
                  <span className="text-muted text-sm">{fmt(selectedFile.size)}</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 36, opacity: .35 }}>📁</span>
                  <span className="text-muted text-sm" style={{ fontWeight: 600 }}>
                    Нажмите или перетащите видео-файл сюда
                  </span>
                </>
              )}
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {fileError && (
              <p style={{ color: 'var(--red)', fontWeight: 600, fontSize: 13, margin: '8px 0' }}>
                ⚠ {fileError}
              </p>
            )}

            <div className="flex gap-8" style={{ marginTop: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fileInput.current?.click()}
              >
                {selectedFile ? 'Выбрать другой файл' : 'Выбрать файл'}
              </button>
              {selectedFile && (
                <button
                  className="btn btn-primary"
                  onClick={uploadFile}
                  disabled={saving}
                >
                  Загрузить видео
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'uploading' && (
          <div className="processing">
            <div className="spinner" />
            <h2>Загрузка видео...</h2>
            <p className="text-muted" style={{ fontWeight: 500 }}>
              {uploadPct < 90 ? `Отправка на сервер: ${uploadPct}%` : 'Сохранение заявки...'}
            </p>
            <div className="progress-bar" style={{ width: 240 }}>
              <div className="fill" style={{ width: `${uploadPct}%`, transition: 'width .3s ease' }} />
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="processing slide-up">
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconCheck size={32} />
            </div>
            <h2>Видео загружено!</h2>
            <p className="text-muted" style={{ fontWeight: 500 }}>
              Ваша заявка передана на рассмотрение комиссии inVision U
            </p>
            <StatusBadge status="review" />
          </div>
        )}

        {(phase === 'select') && (
          <div className="card mt-16">
            <h3>Советы для записи</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIPS.map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, fontWeight: 500 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ color: 'var(--muted)' }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}