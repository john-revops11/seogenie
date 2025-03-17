
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserAuthDisplayProps {
  user: any;
}

export function UserAuthDisplay({ user }: UserAuthDisplayProps) {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };
  
  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => navigate('/auth')}
        className="self-start"
      >
        Login
      </Button>
    );
  }
  
  return (
    <div className="flex items-center gap-2 self-start">
      <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{user.email}</span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleLogout} 
        className="flex items-center gap-1"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
