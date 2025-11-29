import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

const RecentAttendance = () => {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentAttendance();
  }, []);

  const fetchRecentAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
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
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your attendance for the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendance.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(record.date), 'MMM d, yyyy')}
                  </p>
                  {record.check_in_time && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(record.check_in_time), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {record.total_hours && (
                  <span className="text-xs text-muted-foreground">{record.total_hours}h</span>
                )}
                <Badge className={getStatusColor(record.status)} variant="secondary">
                  {record.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAttendance;