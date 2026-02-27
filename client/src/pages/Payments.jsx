import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Payments() {
  const { apiFetch, user, isAdmin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [data, setData] = useState({ members: [], summary: {} });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [myPayments, setMyPayments] = useState([]);
  const [tab, setTab] = useState(isAdmin ? 'all' : 'my');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSettings();
    loadPayments();
    loadMyPayments();
  }, [selectedMonth]);

  async function loadSettings() {
    const res = await apiFetch('/payments/settings');
    if (res.ok) setSettings(await res.json());
  }

  async function loadPayments() {
    const res = await apiFetch(`/payments?month=${selectedMonth}`);
    if (res.ok) setData(await res.json());
  }

  async function loadMyPayments() {
    const res = await apiFetch(`/payments/member/${user.id}`);
    if (res.ok) setMyPayments(await res.json());
  }

  async function handleConfirmPayment(memberId) {
    await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({ member_id: memberId, month: selectedMonth, status: 'paid' })
    });
    loadPayments();
  }

  async function handleMarkUnpaid(memberId) {
    await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({ member_id: memberId, month: selectedMonth, status: 'unpaid', amount: settings?.monthly_fee })
    });
    loadPayments();
  }

  async function handleGenerateMonth() {
    await apiFetch('/payments/generate', {
      method: 'POST',
      body: JSON.stringify({ month: selectedMonth })
    });
    loadPayments();
  }

  function copyAccount() {
    if (settings?.account_number) {
      navigator.clipboard.writeText(settings.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // 월 선택기 (최근 6개월)
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">납부완료</span>;
      case 'pending': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">확인중</span>;
      default: return <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">미납</span>;
    }
  };

  const formatAmount = (n) => new Intl.NumberFormat('ko-KR').format(n);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">회비 관리</h2>

      {/* Bank Account Info */}
      {settings && (
        <article className="bg-surface-light rounded-xl p-4 shadow-sm">
          <h3 className="text-xs text-text-secondary font-medium mb-2">입금 계좌 정보</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-main">{settings.bank_name} {settings.account_number}</p>
              <p className="text-xs text-text-secondary">예금주: {settings.account_holder}</p>
            </div>
            <button onClick={copyAccount}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}>
              {copied ? '복사됨!' : '계좌 복사'}
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm">월 회비: <span className="font-bold text-primary-dark">₩{formatAmount(settings.monthly_fee)}</span></p>
            <p className="text-xs text-text-secondary">매월 {settings.due_day}일까지 납부</p>
          </div>
        </article>
      )}

      {/* Month Selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
        {months.map(m => (
          <button key={m} onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              m === selectedMonth ? 'bg-text-main text-white' : 'bg-gray-100 text-text-secondary'
            }`}>
            {new Date(m + '-01').toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {isAdmin && (
          <button onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'all' ? 'bg-text-main text-white' : 'bg-gray-100 text-text-secondary'}`}>
            전체 현황
          </button>
        )}
        <button onClick={() => setTab('my')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'my' ? 'bg-text-main text-white' : 'bg-gray-100 text-text-secondary'}`}>
          내 납부 내역
        </button>
      </div>

      {/* Summary */}
      {tab === 'all' && data.summary && (
        <div className="flex gap-3">
          <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-green-600">{data.summary.paid || 0}</p>
            <p className="text-xs text-green-600/70 font-medium">납부</p>
          </div>
          <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-red-500">{data.summary.unpaid || 0}</p>
            <p className="text-xs text-red-500/70 font-medium">미납</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-text-secondary">{data.summary.total || 0}</p>
            <p className="text-xs text-text-secondary/70 font-medium">전체</p>
          </div>
        </div>
      )}

      {/* Admin: Generate */}
      {isAdmin && tab === 'all' && (
        <button onClick={handleGenerateMonth}
          className="w-full py-2 bg-gray-100 text-text-secondary text-sm font-medium rounded-lg hover:bg-gray-200 transition">
          {selectedMonth} 회비 일괄 생성
        </button>
      )}

      {/* All Members Payment Status */}
      {tab === 'all' && (
        <div className="space-y-2">
          {data.members.map(m => (
            <div key={m.id} className="bg-surface-light rounded-lg p-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                {m.profile_image ? (
                  <img src={m.profile_image} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{m.name[0]}</div>
                )}
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  {m.paid_date && <p className="text-xs text-text-secondary">{m.paid_date}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(m.payment_status)}
                {isAdmin && m.payment_status !== 'paid' && (
                  <button onClick={() => handleConfirmPayment(m.id)}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">확인</button>
                )}
                {isAdmin && m.payment_status === 'paid' && (
                  <button onClick={() => handleMarkUnpaid(m.id)}
                    className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded font-medium">취소</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Payment History */}
      {tab === 'my' && (
        <div className="space-y-2">
          {myPayments.map(p => (
            <div key={p.id} className="bg-surface-light rounded-lg p-3 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{p.month}</p>
                <p className="text-xs text-text-secondary">₩{formatAmount(p.amount)}</p>
              </div>
              {getStatusBadge(p.status)}
            </div>
          ))}
          {myPayments.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">납부 내역이 없습니다</p>
          )}
        </div>
      )}
    </div>
  );
}
