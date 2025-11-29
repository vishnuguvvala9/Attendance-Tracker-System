import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashboard";

const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      setRole(data?.role || 'employee');
    } catch (error) {
      console.error('Error checking role:', error);
      setRole('employee'); // Default to employee if there's an error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />;
};

export default Dashboard;