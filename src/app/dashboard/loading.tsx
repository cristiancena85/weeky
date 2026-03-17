export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-2xl"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded-lg"></div>
            <div className="h-3 w-48 bg-slate-100 dark:bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6"></div>
        ))}
      </div>

      <div className="h-64 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"></div>
    </div>
  )
}
