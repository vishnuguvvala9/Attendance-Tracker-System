import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays } from "date-fns";

const TeamAttendanceChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchWeeklyTrend();
  }, []);

  const fetchWeeklyTrend = async () => {
    try {
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const chartData = await Promise.all(
        dates.map(async (date) => {
          const { data: attendance, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', date);

          if (error) throw error;

          return {
            date: format(new Date(date), 'EEE'),
            present: attendance?.filter((a) => a.status === 'present').length || 0,
            late: attendance?.filter((a) => a.status === 'late').length || 0,
          };
        })
      );

      setData(chartData);
    } catch (error) {
      console.error('Error fetching weekly trend:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Attendance Trend</CardTitle>
        <CardDescription>Team attendance over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="present"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--success))' }}
            />
            <Line
              type="monotone"
              dataKey="late"
              stroke="hsl(var(--warning))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--warning))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TeamAttendanceChart;