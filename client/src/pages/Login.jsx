import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [devName, setDevName] = useState('');
  const [loading, setLoading] = useState(false);

  // 카카오 로그인
  async function handleKakaoLogin() {
    try {
      const res = await fetch('/api/auth/kakao');
      const data = await res.json();
      window.location.href = data.url;
    } catch {
      alert('카카오 로그인 URL을 가져올 수 없습니다. 서버를 확인해주세요.');
    }
  }

  // 개발용 로그인
  async function handleDevLogin(role = 'admin') {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: devName || '김현석', role })
      });
      const data = await res.json();
      if (data.token) {
        login(data.token, data.member);
        navigate('/');
      }
    } catch (err) {
      alert('로그인 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center px-6">
      {/* Logo & Team Name */}
      <div className="text-center mb-12">
        <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
          <span className="text-3xl font-bold text-text-main">JR</span>
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-1">제이알 게이토스</h1>
        <p className="text-text-secondary font-medium">JR Gators Basketball Club</p>
      </div>

      {/* Kakao Login Button */}
      <button
        onClick={handleKakaoLogin}
        className="w-full max-w-sm py-3.5 bg-kakao rounded-xl text-text-main font-semibold text-base flex items-center justify-center gap-2 shadow-sm hover:brightness-95 transition mb-4"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 3C5.58 3 2 5.79 2 9.25c0 2.17 1.42 4.09 3.58 5.2l-.91 3.36c-.08.29.25.52.5.35l3.87-2.57c.31.03.63.05.96.05 4.42 0 8-2.79 8-6.25S14.42 3 10 3z" fill="#111813"/>
        </svg>
        카카오 로그인
      </button>

      {/* Join Request Link */}
      <button
        onClick={() => navigate('/join')}
        className="text-sm text-text-secondary hover:text-primary transition font-medium mb-12"
      >
        신입부원 가입 신청 →
      </button>

      {/* Dev Login (개발용) */}
      <div className="w-full max-w-sm border-t border-gray-200 pt-6">
        <p className="text-xs text-text-secondary text-center mb-3">개발/테스트용 로그인</p>
        <input
          type="text"
          placeholder="이름 (기본: 김현석)"
          value={devName}
          onChange={e => setDevName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:border-primary"
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleDevLogin('admin')}
            disabled={loading}
            className="flex-1 py-2.5 bg-text-main text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            관리자 로그인
          </button>
          <button
            onClick={() => handleDevLogin('member')}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-200 text-text-main rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            회원 로그인
          </button>
        </div>
      </div>

      <p className="text-xs text-text-secondary mt-8">회장: 김현석</p>
    </div>
  );
}
