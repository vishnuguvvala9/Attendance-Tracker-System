import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, LogIn, LogOut, Calendar, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import AttendanceChart from "@/components/AttendanceChart";
import RecentAttendance from "@/components/RecentAttendance";

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTodayAttendance();
    fetchMonthlyStats();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setTodayAttendance(data);
    } catch (error: any) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const end = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end);

      if (error) throw error;

      const stats = {
        present: data.filter((a) => a.status === 'present').length,
        absent: data.filter((a) => a.status === 'absent').length,
        late: data.filter((a) => a.status === 'late').length,
        totalHours: data.reduce((sum, a) => sum + (a.total_hours || 0), 0),
      };

      setMonthlyStats(stats);
    } catch (error: any) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const checkInTime = now.toISOString();

      const workStartTime = new Date();
      workStartTime.setHours(9, 0, 0, 0);
      const isLate = now > workStartTime;

      const { error } = await supabase.from('attendance').insert({
        user_id: user.id,
        date: today,
        check_in_time: checkInTime,
        status: isLate ? 'late' : 'present',
      });

      if (error) throw error;

      toast({
        title: "Checked in successfully!",
        description: `You checked in at ${format(now, 'h:mm a')}`,
      });

      fetchTodayAttendance();
    } catch (error: any) {
      toast({
        title: "Check-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    setLoading(true);
    try {
      const now = new Date();
      const checkOutTime = now.toISOString();
      const checkInTime = new Date(todayAttendance.check_in_time);
      const totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      const { error } = await supabase
        .from('attendance')
        .update({
          check_out_time: checkOutTime,
          total_hours: Math.round(totalHours * 100) / 100,
        })
        .eq('id', todayAttendance.id);

      if (error) throw error;

      toast({
        title: "Checked out successfully!",
        description: `Total hours: ${Math.round(totalHours * 100) / 100}`,
      });

      fetchTodayAttendance();
      fetchMonthlyStats();
    } catch (error: any) {
      toast({
        title: "Check-out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's your attendance overview for today</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayAttendance
                  ? todayAttendance.check_out_time
                    ? "Checked Out"
                    : "Checked In"
                  : "Not Checked In"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {todayAttendance && todayAttendance.check_in_time
                  ? `at ${format(new Date(todayAttendance.check_in_time), 'h:mm a')}`
                  : format(new Date(), 'EEEE, MMMM d')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{monthlyStats.present}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Late Days</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{monthlyStats.late}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.totalHours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Mark your attendance for today</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            {!todayAttendance || !todayAttendance.check_in_time ? (
              <Button onClick={handleCheckIn} disabled={loading} size="lg" className="gap-2">
                <LogIn className="h-5 w-5" />
                Check In
              </Button>
            ) : !todayAttendance.check_out_time ? (
              <Button onClick={handleCheckOut} disabled={loading} size="lg" className="gap-2" variant="secondary">
                <LogOut className="h-5 w-5" />
                Check Out
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                You've completed your attendance for today. Have a great day!
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceChart />
          <RecentAttendance />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;