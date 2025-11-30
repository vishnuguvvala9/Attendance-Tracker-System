import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Search, Download, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const TeamAttendance = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTeamAttendance();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchQuery, statusFilter]);

  const fetchTeamAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:user_id (
            name,
            employee_id,
            department
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching team attendance:', error);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    if (searchQuery) {
      filtered = filtered.filter(
        (record) =>
          record.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.profiles?.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.profiles?.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    setFilteredAttendance(filtered);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Employee ID", "Name", "Department", "Check In", "Check Out", "Total Hours", "Status"];
    const rows = filteredAttendance.map((record) => [
      record.date,
      record.profiles?.employee_id || "",
      record.profiles?.name || "",
      record.profiles?.department || "",
      record.check_in_time ? format(new Date(record.check_in_time), 'h:mm a') : "",
      record.check_out_time ? format(new Date(record.check_out_time), 'h:mm a') : "",
      record.total_hours || "",
      record.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Attendance</h1>
          <p className="text-muted-foreground">View and manage employee attendance records</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Filter and export attendance data</CardDescription>
              </div>
              <Button onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {record.profiles?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{record.profiles?.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">
                                {record.profiles?.employee_id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{record.profiles?.department}</TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {record.check_in_time
                            ? format(new Date(record.check_in_time), 'h:mm a')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {record.check_out_time
                            ? format(new Date(record.check_out_time), 'h:mm a')
                            : '-'}
                        </TableCell>
                        <TableCell>{record.total_hours ? `${record.total_hours}h` : '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)} variant="secondary">
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeamAttendance;