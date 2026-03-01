import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { apiFetch, isAdmin, user, logout } = useAuth();
  const [tab, setTab] = useState('joins');
  const [joinRequests, setJoinRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [team, setTeam] = useState(null);
  const [settings, setSettings] = useState(null);
  const [teamForm, setTeamForm] = useState({});
  const [settingsForm, setSettingsForm] = useState({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [joinRes, membersRes, teamRes, settingsRes] = await Promise.all([
      apiFetch('/join?status=pending'),
      apiFetch('/members'),
      apiFetch('/team'),
      apiFetch('/payments/settings'),
    ]);
    if (joinRes.ok) setJoinRequests(await joinRes.json());
    if (membersRes.ok) setMembers(await membersRes.json());
    if (teamRes.ok) { const t = await teamRes.json(); setTeam(t); setTeamForm(t); }
    if (settingsRes.ok) { const s = await settingsRes.json(); setSettings(s); setSettingsForm(s); }
  }

  async function handleJoinAction(id, status) {
    await apiFetch(`/join/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    loadAll();
  }

  async function handleRoleChange(memberId, newRole) {
    await apiFetch(`/members/${memberId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole })
    });
    loadAll();
  }

  async function handleSaveTeam() {
    await apiFetch('/team', {
      method: 'PUT',
      body: JSON.stringify(teamForm)
    });
    alert('팀 정보가 저장되었습니다');
    loadAll();
  }

  async function handleSaveSettings() {
    await apiFetch('/payments/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsForm)
    });
    alert('회비 설정이 저장되었습니다');
    loadAll();
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-[48px] text-text-secondary">lock</span>
        <p className="text-text-secondary mt-2">관리자 권한이 필요합니다</p>
      </div>
    );
  }

  const tabs = [
    { id: 'joins', label: '가입 신청', count: joinRequests.length },
    { id: 'members', label: '회원 관리' },
    { id: 'team', label: '팀 정보' },
    { id: 'settings', label: '회비 설정' },
    { id: 'account', label: '내 계정' },
  ];

  const expLabels = { beginner: '초보', '1-3years': '1~3년', '3-5years': '3~5년', '5+years': '5년 이상' };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">관리자</h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition relative ${
              t.id === tab ? 'bg-text-main text-white' : 'bg-gray-100 text-text-secondary'
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Join Requests */}
      {tab === 'joins' && (
        <div className="space-y-3">
          {joinRequests.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">대기 중인 가입 신청이 없습니다</p>
          )}
          {joinRequests.map(r => (
            <article key={r.id} className="bg-surface-light rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                {r.profile_image ? (
                  <img src={r.profile_image} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">{r.name[0]}</div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-text-main">{r.name}</h3>
                  <p className="text-xs text-text-secondary">
                    {r.phone && `📱 ${r.phone}`}
                    {r.position && ` • ${r.position}`}
                    {r.experience && ` • ${expLabels[r.experience] || r.experience}`}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {new Date(r.created_at).toLocaleDateString('ko-KR')} 신청
                  </p>
                </div>
              </div>
              {r.message && (
                <p className="text-sm text-text-main bg-gray-50 rounded-lg p-3 mb-3">{r.message}</p>
              )}
              <div className="flex gap-2">
                <button onClick={() => handleJoinAction(r.id, 'approved')}
                  className="flex-1 py-2 bg-primary text-text-main font-semibold rounded-lg text-sm">
                  승인
                </button>
                <button onClick={() => handleJoinAction(r.id, 'rejected')}
                  className="flex-1 py-2 bg-red-100 text-red-600 font-semibold rounded-lg text-sm">
                  거절
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Member Management */}
      {tab === 'members' && (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="bg-surface-light rounded-lg p-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.profile_image ? (
                  <img src={m.profile_image} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{m.name[0]}</div>
                )}
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-text-secondary">{m.position || '-'} {m.role === 'admin' ? '(관리자)' : '(회원)'}</p>
                </div>
              </div>
              {m.id !== user.id && (
                <select value={m.role}
                  onChange={e => handleRoleChange(m.id, e.target.value)}
                  className="px-2 py-1 rounded border border-gray-200 text-xs bg-white">
                  <option value="member">회원</option>
                  <option value="admin">관리자</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Team Info Edit */}
      {tab === 'team' && teamForm && (
        <div className="bg-surface-light rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">팀 이름</label>
            <input value={teamForm.team_name || ''}
              onChange={e => setTeamForm({ ...teamForm, team_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">팀 이름 (영문)</label>
            <input value={teamForm.team_name_en || ''}
              onChange={e => setTeamForm({ ...teamForm, team_name_en: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">회장</label>
            <input value={teamForm.president || ''}
              onChange={e => setTeamForm({ ...teamForm, president: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">팀 소개</label>
            <textarea value={teamForm.description || ''}
              onChange={e => setTeamForm({ ...teamForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary h-24 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">운동 일정</label>
            <input value={teamForm.practice_schedule || ''}
              onChange={e => setTeamForm({ ...teamForm, practice_schedule: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
              placeholder="예: 매주 화/목 20:00-22:00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">운동 장소</label>
            <input value={teamForm.practice_location || ''}
              onChange={e => setTeamForm({ ...teamForm, practice_location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">카카오톡 채널 URL</label>
            <input value={teamForm.kakao_channel_url || ''}
              onChange={e => setTeamForm({ ...teamForm, kakao_channel_url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
              placeholder="https://pf.kakao.com/..." />
          </div>
          <button onClick={handleSaveTeam}
            className="w-full py-2.5 bg-primary text-text-main font-semibold rounded-lg text-sm">
            저장
          </button>
        </div>
      )}

      {/* Payment Settings */}
      {tab === 'settings' && settingsForm && (
        <div className="bg-surface-light rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">월 회비 (원)</label>
            <input type="number" value={settingsForm.monthly_fee || ''}
              onChange={e => setSettingsForm({ ...settingsForm, monthly_fee: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">은행</label>
            <input value={settingsForm.bank_name || ''}
              onChange={e => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">계좌번호</label>
            <input value={settingsForm.account_number || ''}
              onChange={e => setSettingsForm({ ...settingsForm, account_number: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">예금주</label>
            <input value={settingsForm.account_holder || ''}
              onChange={e => setSettingsForm({ ...settingsForm, account_holder: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">납부 기한 (매월 N일)</label>
            <input type="number" min="1" max="31" value={settingsForm.due_day || ''}
              onChange={e => setSettingsForm({ ...settingsForm, due_day: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <button onClick={handleSaveSettings}
            className="w-full py-2.5 bg-primary text-text-main font-semibold rounded-lg text-sm">
            저장
          </button>
        </div>
      )}

      {/* Account */}
      {tab === 'account' && (
        <div className="bg-surface-light rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            {user?.profile_image ? (
              <img src={user.profile_image} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">{user?.name?.[0]}</div>
            )}
            <div>
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm text-text-secondary">{user?.role === 'admin' ? '관리자' : '회원'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full py-2.5 bg-red-100 text-red-600 font-semibold rounded-lg text-sm mt-4">
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
