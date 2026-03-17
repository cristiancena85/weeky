export default function DepositosLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-20 w-1/3 bg-slate-200 dark:bg-white/10 rounded-2xl mb-4"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-96 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"></div>
    </div>
  )
}
