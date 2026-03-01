import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Members() {
  const { apiFetch } = useAuth();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await apiFetch('/members');
      if (res.ok) setMembers(await res.json());
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">회원 목록</h2>
      <p className="text-sm text-text-secondary">{members.length}명 활동 중</p>
      <div className="space-y-2">
        {members.map(m => (
          <div key={m.id} className="bg-surface-light rounded-lg p-3 shadow-sm flex items-center gap-3">
            {m.profile_image ? (
              <img src={m.profile_image} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">{m.name[0]}</div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{m.name} {m.nickname && `(${m.nickname})`}</p>
              <p className="text-xs text-text-secondary">{m.position || '포지션 미정'} {m.jersey_number != null ? `#${m.jersey_number}` : ''}</p>
            </div>
            {m.role === 'admin' && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary-dark text-[10px] font-bold rounded">관리자</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
