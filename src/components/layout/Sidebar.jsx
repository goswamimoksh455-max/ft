import React from 'react'
import { CATEGORY_ICONS } from '../../utils/constants'
import { fmt } from '../../utils/formatters'

export default function Sidebar({
  user,
  groups,
  activeGroup,
  setActiveGroup,
  loadingGroups,
  setShowCreateGroup,
  setShowJoinGroup,
}) {
  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-slate-900 text-white overflow-hidden">
      <div className="flex h-16 items-center px-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">N</div>
          <span className="text-lg font-bold tracking-tight">Nexora</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Groups</p>
        </div>
        
        {loadingGroups ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-xs text-slate-500 px-2 italic">No groups yet.</p>
        ) : (
          <nav className="space-y-1">
            {groups.map((g) => (
              <button key={g.id} onClick={() => setActiveGroup(g)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all
                  ${activeGroup?.id === g.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="mt-8 space-y-2">
          <button onClick={() => setShowCreateGroup(true)}
            className="w-full flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <span className="text-emerald-400">+</span> Create Group
          </button>
          <button onClick={() => setShowJoinGroup(true)}
            className="w-full flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <span className="text-emerald-400">#</span> Join with Link
          </button>
        </div>
      </div>
    </aside>
  )
}
