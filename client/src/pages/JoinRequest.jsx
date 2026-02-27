import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function JoinRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const kakaoData = location.state || {};

  const [form, setForm] = useState({
    kakao_id: kakaoData.kakaoId || '',
    name: kakaoData.nickname || '',
    phone: '',
    position: '',
    experience: '',
    message: '',
    profile_image: kakaoData.profileImage || ''
  });
  const [submitted, setSubmitted] = useState(kakaoData.hasPendingRequest || false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) { alert('이름을 입력해주세요'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert(data.error || '신청에 실패했습니다');
      }
    } catch {
      alert('서버 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center px-6">
        <div className="bg-surface-light rounded-xl p-8 shadow-sm max-w-sm w-full text-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">check_circle</span>
          </div>
          <h2 className="text-xl font-bold text-text-main mb-2">신청 완료!</h2>
          <p className="text-sm text-text-secondary mb-6">
            가입 신청이 접수되었습니다.<br />관리자 승인을 기다려 주세요.
          </p>
          <button onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-text-main text-white rounded-lg text-sm font-semibold">
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light py-8 px-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-text-main">JR</span>
          </div>
          <h1 className="text-xl font-bold text-text-main">JR 게이토스 가입 신청</h1>
          <p className="text-sm text-text-secondary mt-1">함께 농구하실 분을 모집합니다!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-light rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">이름 *</label>
            <input type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
              placeholder="실명을 입력해주세요" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">전화번호</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
              placeholder="010-0000-0000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">포지션</label>
            <select value={form.position}
              onChange={e => setForm({ ...form, position: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white">
              <option value="">선택 안함</option>
              <option value="PG">포인트가드 (PG)</option>
              <option value="SG">슈팅가드 (SG)</option>
              <option value="SF">스몰포워드 (SF)</option>
              <option value="PF">파워포워드 (PF)</option>
              <option value="C">센터 (C)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">농구 경력</label>
            <select value={form.experience}
              onChange={e => setForm({ ...form, experience: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary bg-white">
              <option value="">선택 안함</option>
              <option value="beginner">초보</option>
              <option value="1-3years">1~3년</option>
              <option value="3-5years">3~5년</option>
              <option value="5+years">5년 이상</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1">자기소개</label>
            <textarea value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary h-24 resize-none"
              placeholder="간단한 자기소개를 해주세요" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary text-text-main font-semibold rounded-lg text-sm disabled:opacity-50">
            {loading ? '신청 중...' : '가입 신청하기'}
          </button>
        </form>

        <button onClick={() => navigate('/login')}
          className="block mx-auto mt-4 text-sm text-text-secondary hover:text-primary transition">
          ← 로그인 페이지로
        </button>
      </div>
    </div>
  );
}
