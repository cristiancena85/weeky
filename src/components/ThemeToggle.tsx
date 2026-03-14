'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative inline-flex h-6 w-12 items-center rounded-full bg-slate-200 dark:bg-slate-700 opacity-50">
        <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1"></span>
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        isDark ? 'bg-purple-600' : 'bg-slate-200'
      }`}
      title="Toggle Theme"
      role="switch"
      aria-checked={isDark}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform flex items-center justify-center shadow-sm ${
          isDark ? 'translate-x-[26px]' : 'translate-x-0.5'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-purple-600" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </span>
    </button>
  )
}
