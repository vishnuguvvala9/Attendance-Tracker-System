import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { UserCheck, Clock } from "lucide-react";

interface TodayAttendanceListProps {
  onUpdate?: () => void;
}

const TodayAttendanceList = ({ onUpdate }: TodayAttendanceListProps) => {
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const { data: attendance, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id (
            name,
            employee_id,
            department
          )
        `)
        .eq('date', today)
        .order('check_in_time', { ascending: true });

      if (error) throw error;
      setAttendanceList(attendance || []);
      onUpdate?.();
    } catch (error) {
      console.error('Error fetching today attendance:', error);
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
        <CardTitle>Today's Attendance</CardTitle>
        <CardDescription>Team members who have checked in</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {attendanceList.length > 0 ? (
            attendanceList.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {record.profiles?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{record.profiles?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{record.profiles?.employee_id}</span>
                      <span>•</span>
                      <span>{record.profiles?.department}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {record.check_in_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(record.check_in_time), 'h:mm a')}
                    </div>
                  )}
                  <Badge className={getStatusColor(record.status)} variant="secondary">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No attendance records yet today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayAttendanceList;