import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function TeamInfo() {
  const { apiFetch } = useAuth();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [teamRes, membersRes] = await Promise.all([
      apiFetch('/team'),
      apiFetch('/members')
    ]);
    if (teamRes.ok) setTeam(await teamRes.json());
    if (membersRes.ok) setMembers(await membersRes.json());
  }

  const positionColors = {
    PG: 'bg-blue-100 text-blue-700',
    SG: 'bg-purple-100 text-purple-700',
    SF: 'bg-green-100 text-green-700',
    PF: 'bg-orange-100 text-orange-700',
    C: 'bg-red-100 text-red-700',
  };

  if (!team) return <div className="text-center text-text-secondary py-8">로딩 중...</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="bg-surface-light rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-bg-dark to-surface-dark p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-text-main">JR</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{team.team_name}</h1>
          <p className="text-primary font-medium">{team.team_name_en || 'JR Gators'}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Team Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              <div>
                <p className="text-xs text-text-secondary">회장</p>
                <p className="text-sm font-medium">{team.president}</p>
              </div>
            </div>
            {team.founded_date && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                <div>
                  <p className="text-xs text-text-secondary">창단일</p>
                  <p className="text-sm font-medium">{team.founded_date}</p>
                </div>
              </div>
            )}
            {team.practice_schedule && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                <div>
                  <p className="text-xs text-text-secondary">운동 일정</p>
                  <p className="text-sm font-medium">{team.practice_schedule}</p>
                </div>
              </div>
            )}
            {team.practice_location && (
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <div>
                  <p className="text-xs text-text-secondary">운동 장소</p>
                  <p className="text-sm font-medium">{team.practice_location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
              <div>
                <p className="text-xs text-text-secondary">팀원</p>
                <p className="text-sm font-medium">{team.member_count}명</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-text-main leading-relaxed">{team.description}</p>
            </div>
          )}

          {/* Kakao Channel */}
          {team.kakao_channel_url && (
            <a href={team.kakao_channel_url} target="_blank" rel="noopener noreferrer"
              className="block w-full py-3 bg-kakao text-text-main font-semibold text-sm rounded-lg text-center">
              카카오톡 채널 추가
            </a>
          )}
        </div>
      </div>

      {/* Member Roster */}
      <div className="bg-surface-light rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-lg mb-4">팀원 명단</h3>
        <div className="space-y-3">
          {members.filter(m => m.is_active).map(m => (
            <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              {m.profile_image ? (
                <img src={m.profile_image} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-text-secondary">
                  {m.name[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{m.name}</p>
                  {m.role === 'admin' && (
                    <span className="px-1.5 py-0.5 bg-primary/20 text-primary-dark text-[10px] font-bold rounded">관리자</span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{m.nickname}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.position && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${positionColors[m.position] || 'bg-gray-100 text-gray-600'}`}>
                    {m.position}
                  </span>
                )}
                {m.jersey_number != null && (
                  <span className="text-lg font-bold text-text-secondary">#{m.jersey_number}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
