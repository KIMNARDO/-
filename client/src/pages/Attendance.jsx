import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Attendance() {
  const { apiFetch, user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [myRecords, setMyRecords] = useState([]);
  const [tab, setTab] = useState('sessions'); // sessions | my

  // 새 세션 폼
  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().slice(0, 10),
    time_start: '20:00', time_end: '22:00', location: '', type: 'practice'
  });

  useEffect(() => { loadSessions(); loadMyRecords(); }, []);

  async function loadSessions() {
    const res = await apiFetch('/attendance/sessions');
    if (res.ok) setSessions(await res.json());
  }

  async function loadMyRecords() {
    const res = await apiFetch('/attendance/my');
    if (res.ok) setMyRecords(await res.json());
  }

  async function loadSessionDetail(id) {
    const res = await apiFetch(`/attendance/sessions/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedSession(data);
      setSessionRecords(data.records || []);
    }
    if (isAdmin) {
      const mRes = await apiFetch('/members');
      if (mRes.ok) setMembers(await mRes.json());
    }
  }

  async function handleSelfCheck(sessionId) {
    const res = await apiFetch('/attendance/check', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
    if (res.ok) {
      alert('출석 체크 완료!');
      loadSessions();
      loadMyRecords();
      if (selectedSession) loadSessionDetail(sessionId);
    } else {
      const data = await res.json();
      alert(data.error || '출석 체크 실패');
    }
  }

  async function handleAdminCheck(sessionId, memberId, status) {
    await apiFetch('/attendance/admin-check', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, member_id: memberId, status })
    });
    loadSessionDetail(sessionId);
  }

  async function handleCreateSession() {
    if (!form.title) { alert('제목을 입력해주세요'); return; }
    const res = await apiFetch('/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ title: '', date: new Date().toISOString().slice(0, 10), time_start: '20:00', time_end: '22:00', location: '', type: 'practice' });
      loadSessions();
    }
  }

  async function handleCloseSession(id) {
    await apiFetch(`/attendance/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'closed' })
    });
    loadSessions();
    setSelectedSession(null);
  }

  const alreadyChecked = (sessionId) =>
    myRecords.some(r => r.session_id === sessionId);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present': return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">출석</span>;
      case 'late': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">지각</span>;
      case 'absent': return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">결석</span>;
      default: return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">미체크</span>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">출석 관리</h2>
        {isAdmin && (
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-3 py-1.5 bg-primary text-text-main text-sm font-semibold rounded-lg">
            + 새 세션
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('sessions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'sessions' ? 'bg-text-main text-white' : 'bg-gray-100 text-text-secondary'}`}>
          세션 목록
        </button>
        <button onClick={() => setTab('my')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'my' ? 'bg-text-main text-white' : 'bg-gray-100 text-text-secondary'}`}>
          내 출석
        </button>
      </div>

      {/* Create Session Form */}
      {showCreate && (
        <div className="bg-surface-light rounded-xl p-4 shadow-sm border border-primary/30">
          <h3 className="font-bold text-sm mb-3">새 출석 세션</h3>
          <div className="space-y-3">
            <input placeholder="제목 (예: 3월 1일 정기운동)" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
            <div className="flex gap-2">
              <input type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
              <select value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary">
                <option value="practice">정기운동</option>
                <option value="game">경기</option>
                <option value="event">행사</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input type="time" value={form.time_start}
                onChange={e => setForm({ ...form, time_start: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
              <input type="time" value={form.time_end}
                onChange={e => setForm({ ...form, time_end: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
            </div>
            <input placeholder="장소" value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
            <button onClick={handleCreateSession}
              className="w-full py-2.5 bg-primary text-text-main font-semibold rounded-lg text-sm">
              세션 생성
            </button>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {tab === 'sessions' && (
        <div className="space-y-3">
          {sessions.map(session => (
            <article key={session.id}
              className={`bg-surface-light rounded-xl p-4 shadow-sm ${session.status === 'open' ? 'border-l-4 border-primary' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{session.title}</h3>
                    {session.status === 'open' ? (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary-dark text-[10px] font-bold rounded-full">진행 중</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">마감</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                    <span>{session.date}</span>
                    {session.time_start && <span>{session.time_start} - {session.time_end}</span>}
                    {session.location && <span>📍 {session.location}</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-text-secondary">{session.attendee_count}명</span>
              </div>

              <div className="flex gap-2 mt-3">
                {session.status === 'open' && !alreadyChecked(session.id) && (
                  <button onClick={() => handleSelfCheck(session.id)}
                    className="flex-1 py-2 bg-primary text-text-main font-semibold rounded-lg text-sm">
                    출석 체크 ✓
                  </button>
                )}
                {session.status === 'open' && alreadyChecked(session.id) && (
                  <span className="flex-1 py-2 bg-green-100 text-green-700 font-semibold rounded-lg text-sm text-center">
                    출석 완료 ✓
                  </span>
                )}
                <button onClick={() => loadSessionDetail(session.id)}
                  className="px-4 py-2 bg-gray-100 text-text-main font-medium rounded-lg text-sm">
                  상세
                </button>
                {isAdmin && session.status === 'open' && (
                  <button onClick={() => handleCloseSession(session.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg text-sm">
                    마감
                  </button>
                )}
              </div>
            </article>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">출석 세션이 없습니다</p>
          )}
        </div>
      )}

      {/* My Records Tab */}
      {tab === 'my' && (
        <div className="space-y-2">
          {myRecords.map(r => (
            <div key={r.id} className="bg-surface-light rounded-lg p-3 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-text-secondary">{r.date} • {r.location}</p>
              </div>
              {getStatusBadge(r.status)}
            </div>
          ))}
          {myRecords.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">출석 기록이 없습니다</p>
          )}
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setSelectedSession(null)}>
          <div className="bg-surface-light rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{selectedSession.title}</h3>
              <button onClick={() => setSelectedSession(null)} className="text-text-secondary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="text-sm text-text-secondary mb-4">
              <p>{selectedSession.date} {selectedSession.time_start} - {selectedSession.time_end}</p>
              <p>{selectedSession.location}</p>
              <p className="font-medium text-text-main mt-1">출석: {sessionRecords.filter(r => r.status === 'present' || r.status === 'late').length}명</p>
            </div>

            {/* Records */}
            <div className="space-y-2">
              {sessionRecords.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    {r.profile_image ? (
                      <img src={r.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{r.name[0]}</div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-text-secondary">{r.checked_by === 'self' ? '셀프' : '관리자'} • {new Date(r.checked_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(r.status)}
                    {isAdmin && !r.confirmed && (
                      <button onClick={() => {
                        apiFetch(`/attendance/confirm/${r.id}`, { method: 'PUT' })
                          .then(() => loadSessionDetail(selectedSession.id));
                      }} className="text-xs text-primary font-medium">확인</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Admin: Quick add members */}
            {isAdmin && selectedSession.status === 'open' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold mb-2">관리자 출석 처리</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {members
                    .filter(m => !sessionRecords.find(r => r.member_id === m.id))
                    .map(m => (
                      <div key={m.id} className="flex items-center justify-between py-1.5">
                        <span className="text-sm">{m.name}</span>
                        <div className="flex gap-1">
                          <button onClick={() => handleAdminCheck(selectedSession.id, m.id, 'present')}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">출석</button>
                          <button onClick={() => handleAdminCheck(selectedSession.id, m.id, 'late')}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">지각</button>
                          <button onClick={() => handleAdminCheck(selectedSession.id, m.id, 'absent')}
                            className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded font-medium">결석</button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
