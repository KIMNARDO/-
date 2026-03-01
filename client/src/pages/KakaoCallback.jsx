import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function KakaoCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('처리 중...');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('인가 코드가 없습니다');
      return;
    }

    async function processCallback() {
      try {
        const res = await fetch('/api/auth/kakao/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });

        const data = await res.json();

        if (data.isNewUser) {
          // 새 사용자 → 가입 신청 페이지로
          navigate('/join', {
            state: {
              kakaoId: data.kakaoId,
              nickname: data.nickname,
              profileImage: data.profileImage,
              hasPendingRequest: data.hasPendingRequest
            }
          });
        } else if (data.isPending) {
          setStatus('가입 승인 대기 중입니다. 관리자에게 문의해주세요.');
        } else if (data.token) {
          login(data.token, data.member);
          navigate('/');
        } else {
          setStatus('로그인에 실패했습니다');
        }
      } catch (err) {
        setStatus('처리 중 오류가 발생했습니다');
      }
    }

    processCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-2xl font-bold text-text-main">JR</span>
        </div>
        <p className="text-text-secondary text-sm">{status}</p>
      </div>
    </div>
  );
}
