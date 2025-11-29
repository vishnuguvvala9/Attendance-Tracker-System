import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Users, TrendingUp, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Check user role and redirect accordingly
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roles?.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">AttendanceHub</span>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4" />
            Trusted by 500+ companies
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Modern Attendance
            <span className="block text-primary mt-2">Tracking Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your workforce management with real-time attendance tracking,
            comprehensive reports, and powerful analytics.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground">Powerful features to manage your team efficiently</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-muted-foreground">
              Employees can check in and out with a single click. Track attendance in real-time
              with automatic status updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-xl bg-success/10 text-success w-fit mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-muted-foreground">
              Comprehensive reports and visualizations help you understand attendance patterns
              and make data-driven decisions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
            <div className="p-3 rounded-xl bg-warning/10 text-warning w-fit mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
            <p className="text-muted-foreground">
              Managers get a complete overview of team attendance with filters, search, and
              export capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-3xl bg-primary text-primary-foreground p-12 text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by Teams Worldwide</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-primary-foreground/80">Uptime Guaranteed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-primary-foreground/80">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of teams already using AttendanceHub to streamline their workforce management.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AttendanceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;