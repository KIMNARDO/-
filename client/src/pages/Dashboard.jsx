import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { apiFetch, user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pendingJoins, setPendingJoins] = useState(0);
  const [team, setTeam] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sessionsRes, paymentsRes, postsRes, teamRes] = await Promise.all([
        apiFetch('/attendance/sessions?status=open&limit=3'),
        apiFetch(`/payments?month=${new Date().toISOString().slice(0, 7)}`),
        apiFetch('/posts?limit=5'),
        apiFetch('/team'),
      ]);

      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPaymentSummary(data.summary);
      }
      if (postsRes.ok) setPosts(await postsRes.json());
      if (teamRes.ok) setTeam(await teamRes.json());

      if (isAdmin) {
        const joinRes = await apiFetch('/join?status=pending');
        if (joinRes.ok) {
          const joins = await joinRes.json();
          setPendingJoins(joins.length);
        }
      }
    } catch {}
  }

  const currentMonth = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome */}
      <div className="bg-surface-light rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-text-main mb-1">
          안녕하세요, {user?.name || user?.nickname}님!
        </h2>
        <p className="text-sm text-text-secondary">오늘도 즐거운 농구 하세요 🏀</p>
      </div>

      {/* Open Sessions */}
      {sessions.length > 0 && (
        <Link to="/attendance" className="block">
          <article className="bg-surface-light rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 z-0" />
            <div className="relative z-10">
              <span className="inline-block px-2 py-1 bg-primary text-text-main text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                출석 진행 중
              </span>
              <h3 className="font-bold text-lg text-text-main">{sessions[0].title}</h3>
              <div className="flex items-center gap-4 text-sm text-text-secondary mt-2">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>{sessions[0].time_start}{sessions[0].time_end ? ` - ${sessions[0].time_end}` : ''}</span>
                </div>
                {sessions[0].location && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>{sessions[0].location}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">group</span>
                <span className="text-sm font-medium">{sessions[0].attendee_count}명 출석</span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Payment Summary */}
      {paymentSummary && (
        <Link to="/payments" className="block">
          <article className="bg-surface-light rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-text-main">{currentMonth} 회비 현황</h3>
              <span className="material-symbols-outlined text-text-secondary text-[20px]">chevron_right</span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-600">{paymentSummary.paid}</p>
                <p className="text-xs text-green-600/70 font-medium">납부완료</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-500">{paymentSummary.unpaid}</p>
                <p className="text-xs text-red-500/70 font-medium">미납</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-text-secondary">{paymentSummary.total}</p>
                <p className="text-xs text-text-secondary/70 font-medium">전체</p>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Admin: Pending Join Requests */}
      {isAdmin && pendingJoins > 0 && (
        <Link to="/admin" className="block">
          <article className="bg-surface-light rounded-xl p-4 shadow-sm border-l-4 border-primary">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">person_add</span>
              <div>
                <h3 className="font-bold text-sm text-text-main">가입 신청 {pendingJoins}건</h3>
                <p className="text-xs text-text-secondary">승인 대기 중인 신청이 있습니다</p>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Team Info Quick */}
      {team && (
        <Link to="/team" className="block">
          <article className="bg-surface-light rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[24px]">info</span>
              <h3 className="font-bold text-sm text-text-main">팀 정보</h3>
            </div>
            <div className="text-sm text-text-secondary space-y-1">
              {team.practice_schedule && <p>📅 {team.practice_schedule}</p>}
              {team.practice_location && <p>📍 {team.practice_location}</p>}
              <p>👥 {team.member_count}명 활동 중</p>
            </div>
          </article>
        </Link>
      )}

      {/* Feed/Posts */}
      {posts.length > 0 && (
        <section>
          <h3 className="font-bold text-sm text-text-main mb-3">최근 소식</h3>
          {posts.map(post => (
            <article key={post.id} className="bg-surface-light rounded-xl p-4 shadow-sm mb-3">
              <div className="flex items-center gap-3 mb-3">
                {post.author_image ? (
                  <img src={post.author_image} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {post.author_name?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-text-main">{post.author_name}</h4>
                  <p className="text-xs text-text-secondary">
                    {post.is_pinned ? '📌 고정 • ' : ''}
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
              {post.title && <h4 className="font-bold text-text-main mb-1">{post.title}</h4>}
              <p className="text-text-main text-sm leading-relaxed">{post.content}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
