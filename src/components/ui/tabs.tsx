'use client';

import * as React from "react"

interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined);

export function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: activeTab, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: any) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500 dark:bg-white/5 dark:text-slate-400 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }: any) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
        ? "bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-slate-50" 
        : "hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-slate-50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: any) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
