import { useState, useEffect } from 'react';

const STORAGE_KEY = 'wildcraft_nickname';

export function getNickname(): string {
  try { return localStorage.getItem(STORAGE_KEY) ?? ''; } catch { return ''; }
}

export function setNickname(name: string) {
  try { localStorage.setItem(STORAGE_KEY, name); } catch { /* noop */ }
}

interface Props {
  open: boolean;
  onClose: (nickname: string) => void;
  isFirstVisit?: boolean;
}

export default function NicknameModal({ open, onClose, isFirstVisit = false }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setValue(getNickname());
    }
  }, [open]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setNickname(trimmed);
    onClose(trimmed);
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      {!isFirstVisit && (
        <div
          onClick={() => { const n = getNickname(); if (n) onClose(n); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(44, 24, 16, 0.5)',
            backdropFilter: 'blur(3px)',
          }}
        />
      )}
      {isFirstVisit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(44, 24, 16, 0.65)',
          backdropFilter: 'blur(3px)',
        }} />
      )}

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 301,
        background: 'linear-gradient(145deg, var(--parch) 0%, var(--cream) 100%)',
        border: '1.5px solid var(--border)',
        borderRadius: 16,
        padding: '28px 24px',
        width: 'min(90vw, 360px)',
        boxShadow: '0 8px 32px rgba(44,24,16,0.25), 0 2px 8px rgba(44,24,16,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>🪵</div>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem' }}>
            {isFirstVisit ? 'WildCraft에 오신걸 환영합니다!' : '닉네임 변경'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            {isFirstVisit
              ? '커뮤니티에서 사용할 닉네임을 설정하세요'
              : 'Q&A 및 커뮤니티에서 사용되는 이름'}
          </p>
        </div>

        <input
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 12))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="닉네임 (최대 12자)"
          maxLength={12}
          autoFocus
          style={{ marginBottom: 12 }}
        />

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: 16 }}>
          {value.length}/12
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!value.trim()}
          style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
        >
          확인
        </button>

        {!isFirstVisit && (
          <button
            className="btn btn-ghost"
            onClick={() => { const n = getNickname(); onClose(n); }}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            취소
          </button>
        )}
      </div>
    </>
  );
}
