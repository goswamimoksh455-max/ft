import React from 'react'

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="flex h-16 justify-around items-center px-2">
        <button onClick={() => setActiveTab('groups')}
          className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors
            ${activeTab === 'groups' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[10px] font-bold">Groups</span>
        </button>
        
        <button onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors
            ${activeTab === 'expenses' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span className="text-[10px] font-bold">Expenses</span>
        </button>

        <button onClick={() => setActiveTab('balances')}
          className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors
            ${activeTab === 'balances' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
          <span className="text-[10px] font-bold">Balances</span>
        </button>

        <button onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 w-16 p-2 rounded-xl transition-colors
            ${activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </nav>
  )
}
