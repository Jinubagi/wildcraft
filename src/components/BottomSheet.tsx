import { useState, useEffect } from 'react';
import { updateSkillItem, addSkillItem } from '../lib/firebase';
import { generateSkillContent } from '../lib/anthropic';

interface Props {
  open: boolean;
  onClose: () => void;
  category: string;
  itemId: string;
  itemTitle: string;
  itemBody?: string;
  itemTags?: string[];
  onItemAdded?: () => void;
}

export default function BottomSheet({
  open,
  onClose,
  category,
  itemId,
  itemTitle,
  itemBody = '',
  itemTags = [],
  onItemAdded,
}: Props) {
  const LEVELS = ['초급', '중급', '고급'] as const;
  type Level = typeof LEVELS[number];

  const [tab, setTab] = useState<'correction' | 'addition'>('correction');
  const [correctionText, setCorrectionText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | ''>('');
  const [additionTopic, setAdditionTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Reset on open — pre-fill correction with existing body + level
  useEffect(() => {
    if (open) {
      setCorrectionText(itemBody);
      const existingLevel = LEVELS.find((l) => itemTags.includes(l)) ?? '';
      setSelectedLevel(existingLevel);
      setAdditionTopic('');
      setGeneratedPreview('');
      setSuccess('');
      setError('');
      setTab(itemId === '__new__' ? 'addition' : 'correction');
    }
  }, [open, itemBody, itemTags, itemId]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  async function handleCorrection() {
    if (!correctionText.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Build new tags: replace level tag, keep non-level tags
      const nonLevelTags = itemTags.filter((t) => !LEVELS.includes(t as typeof LEVELS[number]));
      const newTags = selectedLevel ? [selectedLevel, ...nonLevelTags] : nonLevelTags;
      await updateSkillItem(category, itemId, { body: correctionText, tags: newTags });
      setSuccess('✅ 수정이 저장됐습니다!');
      onItemAdded?.();
    } catch {
      setError('⚠️ 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddition() {
    if (!additionTopic.trim()) return;
    setLoading(true);
    setError('');
    setGeneratedPreview('');

    try {
      const body = await generateSkillContent(
        category,
        additionTopic,
        (chunk) => setGeneratedPreview(chunk),
      );

      // Save to localStorage immediately (guaranteed), Firebase in background
      await addSkillItem(category, {
        title: additionTopic,
        body,
        addedBy: 'community',
      });
      onItemAdded?.();

      setSuccess('✅ AI가 새 스킬을 생성했습니다!');
      setAdditionTopic('');
      setGeneratedPreview('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('시간 초과')
        ? '⚠️ AI 응답이 너무 오래 걸립니다. API 키를 확인하거나 잠시 후 다시 시도하세요.'
        : '⚠️ AI 생성 중 오류가 발생했습니다. VITE_ANTHROPIC_API_KEY를 확인하세요.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(44, 24, 16, 0.6)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: 'var(--parch)',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
        padding: '16px',
        maxHeight: '80dvh',
        overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'var(--border)', margin: '0 auto 16px',
        }} />

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>
            ✏️ 스킬 기여
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            "{itemTitle}"
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 16,
          background: 'var(--cream)', borderRadius: 8, padding: 4,
        }}>
          {(['correction', 'addition'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? 'var(--bark)' : 'var(--text-muted)',
                fontWeight: tab === t ? 600 : 400,
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t === 'correction' ? '✏️ 수정' : '➕ 추가 요청'}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'correction' ? (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              내용을 직접 수정하고 등급을 설정하세요.
            </p>

            {/* Level selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {LEVELS.map((lv) => (
                <button
                  key={lv}
                  onClick={() => setSelectedLevel(selectedLevel === lv ? '' : lv)}
                  disabled={loading}
                  style={{
                    flex: 1, padding: '6px', borderRadius: 6, border: 'none',
                    cursor: 'pointer', fontSize: '0.85rem',
                    fontFamily: 'var(--font-body)',
                    background: selectedLevel === lv ? 'var(--moss)' : 'var(--cream)',
                    color: selectedLevel === lv ? 'white' : 'var(--text-muted)',
                    fontWeight: selectedLevel === lv ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {lv}
                </button>
              ))}
            </div>

            <textarea
              className="input"
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="수정할 내용을 작성해주세요..."
              rows={8}
              disabled={loading}
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', lineHeight: 1.7 }}
            />
            <button
              className="btn btn-primary"
              onClick={handleCorrection}
              disabled={loading || !correctionText.trim()}
              style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            >
              {loading ? <span className="spinner" /> : '📤 수정 제안 보내기'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 10 }}>
              AI가 관련 스킬 내용을 생성하여 목록에 바로 추가합니다.
            </p>
            <input
              className="input"
              value={additionTopic}
              onChange={(e) => setAdditionTopic(e.target.value)}
              placeholder="추가하고 싶은 스킬 주제 (예: 나뭇잎 차 만들기)"
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleAddition}
              disabled={loading || !additionTopic.trim()}
              style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <><span className="spinner" style={{ marginRight: 6 }} /> AI 생성 중<span className="loading-dots" /></>
              ) : '🤖 AI로 스킬 생성하기'}
            </button>

            {/* Streaming preview */}
            {generatedPreview && (
              <div style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 8,
                background: 'var(--cream)', border: '1px solid var(--border)',
                fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6,
                maxHeight: 180, overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                <span style={{
                  display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)',
                  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  🤖 생성 중...
                </span>
                {generatedPreview}
              </div>
            )}
          </div>
        )}

        {/* Status messages */}
        {success && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8,
            background: '#e8f0e0', color: 'var(--moss)', fontSize: '0.9rem',
          }}>{success}</div>
        )}
        {error && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8,
            background: '#fce8e2', color: 'var(--ember)', fontSize: '0.9rem',
          }}>{error}</div>
        )}

        <button
          className="btn btn-ghost"
          onClick={onClose}
          style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
        >
          닫기
        </button>
      </div>
    </>
  );
}
