import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import TeamAttendanceChart from "@/components/TeamAttendanceChart";
import TodayAttendanceList from "@/components/TodayAttendanceList";

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total employees (excluding managers)
      const { data: employees, error: employeesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'employee');

      if (employeesError) throw employeesError;

      const today = format(new Date(), 'yyyy-MM-dd');

      // Get today's attendance
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      if (attendanceError) throw attendanceError;

      setStats({
        totalEmployees: employees?.length || 0,
        presentToday: attendance?.filter((a) => a.status === 'present').length || 0,
        absentToday: (employees?.length || 0) - (attendance?.length || 0),
        lateToday: attendance?.filter((a) => a.status === 'late').length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Overview of team attendance and performance</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1">Active team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.presentToday}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalEmployees > 0
                  ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance`
                  : 'No data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.lateToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.absentToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Not checked in</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TeamAttendanceChart />
          <TodayAttendanceList onUpdate={fetchStats} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;