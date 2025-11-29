import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock, LayoutDashboard, Calendar, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    fetchProfile(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'History', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <span className="font-bold">AttendanceHub</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">AttendanceHub</h2>
                <p className="text-xs text-muted-foreground">Track & Manage</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-3">
            {profile && (
              <div className="px-3 py-2 rounded-lg bg-muted">
                <p className="font-medium text-sm">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.employee_id}</p>
                <p className="text-xs text-muted-foreground">{profile.department}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;