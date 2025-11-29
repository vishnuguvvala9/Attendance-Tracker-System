import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

const AttendanceHistory = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedDateData, setSelectedDateData] = useState<any>(null);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = format(startOfMonth(date || new Date()), 'yyyy-MM-dd');
      const end = format(endOfMonth(date || new Date()), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);

      // Check if selected date has attendance
      if (date) {
        const selectedDate = format(date, 'yyyy-MM-dd');
        const dayData = data?.find((a) => a.date === selectedDate);
        setSelectedDateData(dayData || null);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground';
      case 'late':
        return 'bg-warning text-warning-foreground';
      case 'absent':
        return 'bg-destructive text-destructive-foreground';
      case 'half-day':
        return 'bg-accent text-accent-foreground';
      default:
        return '';
    }
  };

  const modifiers = {
    present: attendance
      .filter((a) => a.status === 'present')
      .map((a) => new Date(a.date)),
    late: attendance
      .filter((a) => a.status === 'late')
      .map((a) => new Date(a.date)),
    absent: attendance
      .filter((a) => a.status === 'absent')
      .map((a) => new Date(a.date)),
  };

  const modifiersStyles = {
    present: { backgroundColor: 'hsl(var(--success))', color: 'white', borderRadius: '8px' },
    late: { backgroundColor: 'hsl(var(--warning))', color: 'white', borderRadius: '8px' },
    absent: { backgroundColor: 'hsl(var(--destructive))', color: 'white', borderRadius: '8px' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Attendance History</h1>
          <p className="text-muted-foreground">View your attendance records</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Click on a date to see details</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
              <div className="flex gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-success"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-warning"></div>
                  <span className="text-sm">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive"></div>
                  <span className="text-sm">Absent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateData ? (
                <div className="space-y-4">
                  <div>
                    <Badge className={getStatusColor(selectedDateData.status)}>
                      {selectedDateData.status.toUpperCase()}
                    </Badge>
                  </div>

                  {selectedDateData.check_in_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Check In</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedDateData.check_in_time), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDateData.check_out_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Check Out</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedDateData.check_out_time), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDateData.total_hours && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Total Hours</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDateData.total_hours} hours
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {date ? 'No attendance record for this date' : 'Select a date to view details'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>Your latest attendance entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendance.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{format(new Date(record.date), 'MMMM d, yyyy')}</p>
                      {record.check_in_time && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(record.check_in_time), 'h:mm a')}
                          {record.check_out_time &&
                            ` - ${format(new Date(record.check_out_time), 'h:mm a')}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {record.total_hours && (
                      <span className="text-sm text-muted-foreground">{record.total_hours}h</span>
                    )}
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceHistory;