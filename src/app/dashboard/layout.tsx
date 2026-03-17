import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { MobileNav } from '@/components/dashboard/MobileNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Dejamos de esperar (await) el perfil aquí para no bloquear el renderizado del shell.
  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    } catch {
      return null;
    }
  };

  const profilePromise = fetchProfile();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020205] flex transition-colors duration-300">
      {/* Barra Lateral (Desktop) */}
      <Sidebar profilePromise={profilePromise} />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Barra Superior */}
        <Topbar user={user} profilePromise={profilePromise} />

        {/* Zona de Contenido */}
        <main className="flex-1 pb-32 lg:pb-10 overflow-x-hidden">
          {children}
        </main>

        {/* Navegación Móvil (Bottom) */}
        <MobileNav />
      </div>
    </div>
  );
}
