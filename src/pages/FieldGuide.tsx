import { useState, useRef } from 'react';
import { identifySpecies } from '../lib/anthropic';

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

export default function FieldGuide() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const imageDataRef = useRef<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' } | null>(null);

  function handleFile(file: File) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('JPG, PNG, WEBP, GIF 형식만 지원합니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    setError('');
    setResult('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      imageDataRef.current = {
        base64,
        mediaType: file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
      };
    };
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!imageDataRef.current) return;
    setLoading(true);
    setResult('');
    setError('');
    try {
      await identifySpecies(
        imageDataRef.current.base64,
        imageDataRef.current.mediaType,
        (text) => setResult(text),
      );
    } catch {
      setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult('');
    setError('');
    imageDataRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="page">
      <h1 style={{ margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>🔬</span><span>동식물 도감</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 24 }}>
        사진을 올리면 AI가 종을 식별하고 식용 여부를 알려줍니다
      </p>

      {/* 업로드 영역 */}
      {!preview ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 14,
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--cream)',
            transition: 'all 0.2s',
            marginBottom: 16,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--moss)';
            e.currentTarget.style.background = 'rgba(74,124,62,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--cream)';
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
          <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--bark)' }}>
            사진을 클릭하거나 드래그하여 업로드
          </p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            JPG · PNG · WEBP · GIF · 최대 5MB
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            <img
              src={preview}
              alt="업로드된 사진"
              style={{ width: '100%', maxHeight: 360, objectFit: 'contain', background: '#000', display: 'block' }}
            />
            <button
              onClick={reset}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: 20, color: 'white', cursor: 'pointer',
                padding: '4px 10px', fontSize: '0.82rem',
              }}
            >✕ 다시 선택</button>
          </div>

          {!result && (
            <button
              className="btn btn-primary"
              onClick={analyze}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '12px' }}
            >
              {loading
                ? <><span className="spinner" style={{ marginRight: 8 }} />분석 중...</>
                : '🔍 AI 식별 시작'}
            </button>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(191,76,28,0.1)', border: '1px solid rgba(191,76,28,0.25)',
          color: 'var(--ember)', fontSize: '0.9rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* 분석 결과 */}
      {(result || loading) && (
        <div style={{
          background: 'linear-gradient(145deg, var(--surface) 0%, #fdfaf7 100%)',
          border: '1.5px solid var(--border)',
          borderRadius: 14, padding: '18px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {loading && !result && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              🌿 분석 중<span className="loading-dots" />
            </div>
          )}
          {result && (
            <>
              <div
                className="prose"
                style={{ fontSize: '0.93rem' }}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(result) }}
              />
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(191,76,28,0.07)', border: '1px solid rgba(191,76,28,0.2)',
                fontSize: '0.8rem', color: 'var(--ember)',
              }}>
                ⚠️ AI 식별은 참고용입니다. 야생에서 직접 채취·섭취 전 반드시 전문가에게 재확인하세요.
              </div>
              <button
                className="btn btn-ghost"
                onClick={reset}
                style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
              >
                📷 새 사진 분석하기
              </button>
            </>
          )}
        </div>
      )}

      {/* 안내 */}
      {!preview && !result && (
        <div style={{
          marginTop: 8, padding: '14px 16px', borderRadius: 12,
          background: 'var(--cream)', border: '1px solid var(--border)',
          fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65,
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--bark)' }}>📌 잘 찍는 팁</p>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>식물: 잎, 줄기, 꽃, 열매가 모두 보이게</li>
            <li>물고기: 옆면 전체가 보이게, 밝은 곳에서</li>
            <li>버섯: 갓 위아래, 줄기까지 함께</li>
            <li>배경이 단순할수록 식별 정확도 향상</li>
          </ul>
        </div>
      )}
    </div>
  );
}
