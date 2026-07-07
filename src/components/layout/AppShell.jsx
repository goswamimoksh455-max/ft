import React, { useState, useEffect } from 'react'
import { api } from '../../api/apiClient'
import { fmt } from '../../utils/formatters'
import { CATEGORY_ICONS } from '../../utils/constants'

// Components
import CreateGroupModal from '../groups/CreateGroupModal'
import JoinGroupModal from '../groups/JoinGroupModal'
import AddExpenseModal from '../expenses/AddExpenseModal'
import SettleUpModal from '../settlements/SettleUpModal'
import ProfileTab from '../profile/ProfileTab'
import Toast from '../common/Toast'

function Spinner() {
  return <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
}

export default function AppShell({ token, user, onLogout }) {
  const [groups, setGroups]         = useState([])
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [groupDetail, setGroupDetail] = useState(null)   // { group, members }
  const [expenses, setExpenses]     = useState([])
  const [balances, setBalances]     = useState(null)     // { members, settlements }
  const [settlements, setSettlements] = useState([])
  const [activeTab, setActiveTab]   = useState('expenses')

  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showJoinGroup, setShowJoinGroup]     = useState(false)
  const [showExpense, setShowExpense]         = useState(false)
  const [showSettle, setShowSettle]           = useState(false)

  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState(null)  // { message, type }

  const showToast = (message, type = 'success') => setToast({ message, type })

  // ── Load groups on mount ────────────────────────────────────────────────
  useEffect(() => {
    api('/api/v1/groups', { token }).then((d) => {
      setGroups(d.groups)
      if (d.groups.length > 0) setActiveGroupId(d.groups[0].id)
      else setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  // ── Load group detail + expenses + balances + settlements when group changes ──
  useEffect(() => {
    if (!activeGroupId) return
    setLoading(true)
    setExpenses([])
    setBalances(null)
    setSettlements([])

    Promise.all([
      api(`/api/v1/groups/${activeGroupId}`, { token }),
      api(`/api/v1/groups/${activeGroupId}/expenses`, { token }),
      api(`/api/v1/groups/${activeGroupId}/balances`, { token }),
      api(`/api/v1/groups/${activeGroupId}/settlements`, { token }),
    ]).then(([gd, ed, bd, sd]) => {
      setGroupDetail({ group: gd.group, members: gd.group.members })
      setExpenses(ed.expenses || [])
      // Map new backend response shape to what the UI expects
      const members = (bd.balances || []).map(m => ({
        ...m, id: m.userId, net: Number(m.netBalance || 0)
      }))
      const settlements = (bd.simplifiedDebts || []).map(d => ({
        from: { ...d.from, displayName: d.from?.displayName || d.from?.username },
        to:   { ...d.to,   displayName: d.to?.displayName   || d.to?.username, upiId: d.to?.upiId },
        amount: d.amount
      }))
      setBalances({ members, settlements })
      setSettlements(sd.settlements || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [activeGroupId, token])

  // Redirect to groups tab on mobile/boot if activeGroupId is null
  useEffect(() => {
    if (!activeGroupId && activeTab !== 'profile') {
      setActiveTab('groups')
    }
  }, [activeGroupId, activeTab])

  function refreshExpenses() {
    Promise.all([
      api(`/api/v1/groups/${activeGroupId}/expenses`, { token }),
      api(`/api/v1/groups/${activeGroupId}/balances`, { token }),
      api(`/api/v1/groups/${activeGroupId}/settlements`, { token }),
    ]).then(([ed, bd, sd]) => {
      setExpenses(ed.expenses || [])
      const members = (bd.balances || []).map(m => ({
        ...m, id: m.userId, net: Number(m.netBalance || 0)
      }))
      const settlements = (bd.simplifiedDebts || []).map(d => ({
        from: { ...d.from, displayName: d.from?.displayName || d.from?.username },
        to:   { ...d.to,   displayName: d.to?.displayName   || d.to?.username, upiId: d.to?.upiId },
        amount: d.amount
      }))
      setBalances({ members, settlements })
      setSettlements(sd.settlements || [])
    })
  }

  const activeGroup = groupDetail?.group
  const members     = groupDetail?.members || []

  // Summary totals from balances
  const myNet   = balances?.members?.find((m) => m.id === user.id)?.net || 0
  const totalOwed  = balances?.members?.reduce((s, m) => m.id !== user.id && m.net < -0.005 ? s + Math.abs(m.net) : s, 0) || 0
  const totalOwing = balances?.members?.reduce((s, m) => m.id !== user.id && m.net > 0.005 ? s + m.net : s, 0) || 0
  const settlementDirectionByUser = (balances?.settlements || []).reduce((acc, s) => {
    const fromId = s.from?.id
    const toId = s.to?.id
    const fromName = s.from?.displayName || s.from?.username || 'Member'
    const toName = s.to?.displayName || s.to?.username || 'Member'

    if (fromId && toId) {
      if (!acc[fromId]) acc[fromId] = { payTo: new Set(), receiveFrom: new Set(), selfName: fromName }
      if (!acc[toId]) acc[toId] = { payTo: new Set(), receiveFrom: new Set(), selfName: toName }

      acc[fromId].payTo.add(toName)
      acc[toId].receiveFrom.add(fromName)
    }

    return acc
  }, {})

  const nonZeroOptimizationMembers = (balances?.members || []).filter((m) => Math.abs(Number(m.net || 0)) > 0.005)

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-slate-100 font-sans">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-slate-900 text-white overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-sm text-white">N</div>
          <span className="font-bold text-lg tracking-tight">Nexora</span>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="rounded-xl bg-slate-800 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
              {(user.displayName || user.username || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user.displayName || user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Create / Join */}
        <div className="px-4 py-3 flex gap-2 border-b border-slate-800">
          <button onClick={() => setShowCreateGroup(true)}
            className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-bold text-white hover:bg-emerald-400 transition-colors">
            + New
          </button>
          <button onClick={() => setShowJoinGroup(true)}
            className="flex-1 rounded-xl bg-slate-700 py-2 text-sm font-bold text-slate-200 hover:bg-slate-600 transition-colors">
            Join
          </button>
        </div>

        {/* Group list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Your Groups</p>
          {groups.length === 0 && !loading && (
            <p className="text-xs text-slate-500 px-2 py-3">No groups yet. Create one!</p>
          )}
          {groups.map((g) => (
            <button key={g.id} onClick={() => setActiveGroupId(g.id)}
              className={`w-full rounded-xl px-3 py-3 text-left transition-all
                ${activeGroupId === g.id
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'hover:bg-slate-800 border border-transparent text-slate-300'}`}>
              <p className="text-sm font-bold truncate">{g.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{g.memberCount} member{g.memberCount !== 1 ? 's' : ''} · {g.currency}</p>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="px-4 py-4 border-t border-slate-800">
          <button onClick={onLogout}
            className="w-full rounded-xl border border-slate-700 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col h-full min-h-0 overflow-hidden relative">

        {/* Top header bar */}
        <header className="flex items-center justify-between gap-3 bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 truncate">
              {activeTab === 'profile'
                ? 'My Profile'
                : activeTab === 'groups'
                  ? 'My Groups'
                  : activeGroup
                    ? activeGroup.name
                    : `Hello, ${(user.displayName || user.username || 'User').split(' ')[0]} 👋`}
            </h1>
            {activeTab !== 'profile' && activeTab !== 'groups' && activeGroup && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {members.length} member{members.length !== 1 ? 's' : ''} · {activeGroup.currency} · {activeGroup.description || 'No description'}
              </p>
            )}
          </div>
          {activeTab !== 'profile' && activeTab !== 'groups' && activeGroup && (
            <div className="flex gap-2">
              <button onClick={() => setShowExpense(true)}
                className="hidden sm:inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
                + Add Expense
              </button>
              <button onClick={() => setShowSettle(true)}
                className="rounded-xl bg-emerald-500 px-3 md:px-4 py-2 text-xs md:text-sm font-bold text-white hover:bg-emerald-600 transition-colors">
                Settle Up
              </button>
            </div>
          )}
        </header>

        {/* Stat cards */}
        {activeGroup && activeTab !== 'profile' && activeTab !== 'groups' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 px-4 md:px-6 py-4 flex-shrink-0 bg-white border-b border-slate-200">
            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4">
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">To Pay</p>
              <p className="mt-1 text-xl md:text-2xl font-extrabold text-rose-600">{fmt(Math.max(0, -myNet))}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">To Receive</p>
              <p className="mt-1 text-xl md:text-2xl font-extrabold text-emerald-600">{fmt(Math.max(0, myNet))}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</p>
              <p className={`mt-1 text-xl md:text-2xl font-extrabold ${myNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmt(myNet)}</p>
            </div>
          </div>
        )}

        {/* Tabs (Desktop only) */}
        {activeGroup && (
          <div className="hidden md:flex gap-1 px-6 pt-4 flex-shrink-0 bg-slate-50 border-b border-slate-200">
            {['expenses', 'balances', 'members', 'profile'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px
                  ${activeTab === tab
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 pb-24 md:pb-0">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          )}

          {!activeGroup && !loading && activeTab !== 'groups' && activeTab !== 'profile' && (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
              <div className="text-6xl mb-4">💸</div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Welcome to Nexora</h2>
              <p className="text-slate-500 max-w-sm">Create a group or join one using an invite link to start splitting expenses.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateGroup(true)}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700">
                  + Create Group
                </button>
                <button onClick={() => setShowJoinGroup(true)}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-white">
                  Join via Link
                </button>
              </div>
            </div>
          )}

          {!loading && (
            <div className="px-4 md:px-6 py-4 md:py-5">

              {/* GROUPS tab (Mobile only, handles group switching & settings) */}
              {activeTab === 'groups' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  {/* User profile summary */}
                  <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-soft">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {(user.displayName || user.username || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{user.displayName || user.username}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <button onClick={onLogout}
                        className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setShowCreateGroup(true)}
                      className="rounded-xl bg-emerald-500 h-11 text-xs font-bold text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1 shadow-soft">
                      <span>+ New Group</span>
                    </button>
                    <button onClick={() => setShowJoinGroup(true)}
                      className="rounded-xl bg-slate-900 h-11 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 shadow-soft">
                      <span>Join Group</span>
                    </button>
                  </div>

                  {/* Group list */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">Your Groups</p>
                    {groups.length === 0 && (
                      <div className="text-center py-10 rounded-2xl border border-dashed border-slate-300 bg-white">
                        <p className="text-sm text-slate-500">No groups yet. Create or join one!</p>
                      </div>
                    )}
                    {groups.map((g) => {
                      const isActive = activeGroupId === g.id
                      return (
                        <button key={g.id} onClick={() => { setActiveGroupId(g.id); setActiveTab('expenses') }}
                          className={`w-full rounded-2xl p-4 text-left transition-all border flex items-center justify-between bg-white shadow-sm
                            ${isActive
                              ? 'border-emerald-500 ring-2 ring-emerald-100'
                              : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{g.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{g.memberCount} member{g.memberCount !== 1 ? 's' : ''} · {g.currency}</p>
                          </div>
                          {isActive && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Active</span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Active group settings & members */}
                  {activeGroup && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Invite Link</p>
                        <div className="flex gap-2">
                          <input readOnly value={`${window.location.origin}/invite/${activeGroup?.id || ''}`}
                            className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none" />
                          <button onClick={() => {
                            navigator.clipboard?.writeText(`${window.location.origin}/invite/${activeGroup?.id || ''}`)
                            showToast('Invite link copied!')
                          }} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Members ({members.length})</p>
                        <div className="space-y-2">
                          {members.map((m) => (
                            <div key={m.id} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                                  {(m.displayName || m.username || '?')[0].toUpperCase()}
                                </div>
                                <span className="text-xs font-semibold text-slate-800">{m.displayName || m.username}{m.id === user.id ? ' (you)' : ''}</span>
                              </div>
                              <span className={`text-[10px] rounded-full px-2 py-0.5 font-bold capitalize ${m.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                {m.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeGroup && (
                <>
                  {/* EXPENSES tab */}
                  {activeTab === 'expenses' && (
                    <div className="space-y-2 max-w-2xl mx-auto">
                      {expenses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <p className="text-5xl mb-3">🧾</p>
                          <p className="font-bold text-slate-700 text-lg">No expenses yet</p>
                          <p className="text-sm text-slate-400 mt-1">Add your first expense to start tracking.</p>
                          <button onClick={() => setShowExpense(true)}
                            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-700">
                            + Add Expense
                          </button>
                        </div>
                      )}
                      {expenses.map((exp) => {
                        const paidByMe = exp.paidBy === user.id
                        const share = Number(exp.your_share) || 0
                        const youOweAmt = paidByMe ? -(exp.amount - share) : share
                        return (
                          <article key={exp.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 md:px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all shadow-sm">
                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                              <span className="text-2xl flex-shrink-0">{CATEGORY_ICONS[exp.category] || '📦'}</span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{exp.description || exp.title || 'Expense'}</p>
                                <p className="text-xs text-slate-500 mt-0.5 truncate">
                                  {exp.category} · Paid by {exp.paidByUser?.displayName || exp.paidByUser?.username || 'Someone'}
                                  {paidByMe ? ' (you)' : ''}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {new Date(exp.expenseDate || exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  &nbsp;· <span className="capitalize">{exp.splitType} split</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base md:text-lg font-extrabold text-slate-900">{fmt(exp.amount)}</p>
                              <p className={`text-xs font-bold mt-0.5 ${youOweAmt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {youOweAmt > 0.005
                                  ? `you owe ${fmt(youOweAmt)}`
                                  : youOweAmt < -0.005
                                    ? `you're owed ${fmt(Math.abs(youOweAmt))}`
                                    : 'settled'}
                              </p>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}

                  {/* BALANCES tab */}
                  {activeTab === 'balances' && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {balances && (
                        <>
                          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                            {balances.members.map((m) => (
                              <article key={m.id} className={`rounded-2xl border p-4 bg-white shadow-sm ${m.net >= 0 ? 'border-emerald-100' : 'border-rose-100'}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0
                                    ${m.net >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {(m.displayName || m.username || '?')[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{m.displayName || m.username}{m.id === user.id ? ' (you)' : ''}</p>
                                    <p className={`text-xs font-semibold truncate ${m.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {m.net >= 0 ? `to receive ${fmt(m.net)}` : `to pay ${fmt(Math.abs(m.net))}`}
                                    </p>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>

                          {balances.settlements.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm font-bold text-slate-700">Optimized Settlement Plan</p>
                              <div className="space-y-2">
                                {nonZeroOptimizationMembers.map((m) => {
                                  const selfName = m.displayName || m.username || 'Member'
                                  const direction = settlementDirectionByUser[m.id]
                                  const payTargets = direction ? [...direction.payTo] : []
                                  const receiveSources = direction ? [...direction.receiveFrom] : []

                                  if (m.net < -0.005 && payTargets.length > 0) {
                                    return (
                                      <div key={`opt-${m.id}-pay`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                        <p className="text-sm text-slate-700 flex items-center justify-between">
                                          <span><span className="font-bold">{selfName}</span> owes</span>
                                          <span className="text-rose-600 font-bold mx-2">&rarr;</span>
                                          <span className="font-bold text-right">{payTargets.join(', ')}</span>
                                        </p>
                                      </div>
                                    )
                                  }

                                  if (m.net > 0.005 && receiveSources.length > 0) {
                                    return (
                                      <div key={`opt-${m.id}-receive`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                        <p className="text-sm text-slate-700 flex items-center justify-between">
                                          <span><span className="font-bold">{selfName}</span> receives from</span>
                                          <span className="text-emerald-600 font-bold mx-2">&larr;</span>
                                          <span className="font-bold text-right">{receiveSources.join(', ')}</span>
                                        </p>
                                      </div>
                                    )
                                  }

                                  return null
                                })}
                              </div>
                            </div>
                          )}

                          {balances.settlements.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                              <p className="text-4xl mb-2">🎉</p>
                              <p className="font-bold text-slate-700">All balanced!</p>
                              <p className="text-sm text-slate-400 mt-1">No settlements needed in this group.</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* MEMBERS tab (Desktop only) */}
                  {activeTab === 'members' && (
                    <div className="space-y-3 max-w-2xl mx-auto">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Invite Link</p>
                        <div className="flex gap-2">
                          <input readOnly value={`${window.location.origin}/invite/${activeGroup?.id || ''}`}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none" />
                          <button onClick={() => {
                            navigator.clipboard?.writeText(`${window.location.origin}/invite/${activeGroup?.id || ''}`)
                            showToast('Invite link copied!')
                          }} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">
                            Copy
                          </button>
                        </div>
                      </div>
                      {members.map((m) => (
                        <article key={m.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 flex-shrink-0">
                              {(m.displayName || m.username || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{m.displayName || m.username}{m.id === user.id ? ' (you)' : ''}</p>
                              {m.upiId && <p className="text-xs text-slate-400">UPI: {m.upiId}</p>}
                            </div>
                          </div>
                          <span className={`text-xs rounded-full px-3 py-1 font-semibold
                            ${m.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            {m.role}
                          </span>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* PROFILE tab */}
              {activeTab === 'profile' && (
                <div className="max-w-md mx-auto">
                  <ProfileTab token={token} user={user} showToast={showToast} />
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {showCreateGroup && (
        <CreateGroupModal token={token} onClose={() => setShowCreateGroup(false)}
          onCreated={(g) => {
            setGroups((prev) => [{ ...g, memberCount: 1 }, ...prev])
            setActiveGroupId(g.id)
            setShowCreateGroup(false)
            showToast('Group created!')
          }} />
      )}

      {showJoinGroup && (
        <JoinGroupModal token={token} user={user} onClose={() => setShowJoinGroup(false)}
          onJoined={(g) => {
            setGroups((prev) => {
              const exists = prev.find(x => x.id === g.id)
              if (exists) return prev
              return [{ ...g, memberCount: (g.memberCount || 1) }, ...prev]
            })
            setActiveGroupId(g.id)
            setShowJoinGroup(false)
            showToast('Joined group successfully!')
          }} />
      )}

      {showExpense && activeGroup && (
        <AddExpenseModal
          token={token} group={activeGroup} members={members} currentUser={user}
          onClose={() => setShowExpense(false)}
          onAdded={() => {
            setShowExpense(false)
            refreshExpenses()
            showToast('Expense added!')
          }} />
      )}

      {showSettle && activeGroup && (
        <SettleUpModal
          token={token} group={activeGroup}
          simplifiedDebts={balances?.settlements || []}
          members={members} currentUser={user}
          onClose={() => setShowSettle(false)}
          onSettled={() => { refreshExpenses(); showToast('Settlement recorded!') }} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden flex flex-shrink-0 bg-white border-t border-slate-200 pb-safe">
        {['expenses', 'balances', 'groups', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors
              ${activeTab === tab ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <span className="text-xs font-bold capitalize">{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
