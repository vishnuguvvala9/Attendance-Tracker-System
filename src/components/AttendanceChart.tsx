import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

const AttendanceChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return format(date, 'yyyy-MM-dd');
      });

      const { data: attendance, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .in('date', dates);

      if (error) throw error;

      const chartData = dates.map((date) => {
        const record = attendance?.find((a) => a.date === date);
        return {
          date: format(new Date(date), 'EEE'),
          hours: record?.total_hours || 0,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Hours</CardTitle>
        <CardDescription>Your working hours for the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
            <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;