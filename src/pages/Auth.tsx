
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ChevronRight } from "lucide-react";
import { SeoAnimatedBackground } from "@/components/auth/SeoAnimatedBackground";

// Instead of trying to access protected properties, we'll use the actual URL values
const SUPABASE_URL = "https://rgtptfhlkplnahzehpci.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndHB0Zmhsa3BsbmFoemVocGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMDI5ODEsImV4cCI6MjA1NjY3ODk4MX0.rhXFrgtnfQMfpDue4DvnxqMW59FRbscNp1Nib4VRyIQ";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [creatingTestUsers, setCreatingTestUsers] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        navigate('/');
      }
    });

    // Create test users when the page loads
    const createTestUsers = async () => {
      setCreatingTestUsers(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/create-test-users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating test users:", errorData);
          return;
        }
        
        const data = await response.json();
        console.log("Test users created:", data);
        
        // Show a toast message about the test users
        toast.success("Test users are ready to use");
      } catch (error) {
        console.error("Error invoking Edge Function:", error);
      } finally {
        setCreatingTestUsers(false);
      }
    };

    createTestUsers();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (isSignUp) {
        toast.success("Registration successful! Please check your email for verification.");
      } else {
        toast.success("Login successful!");
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Login Form Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isSignUp 
                ? "Sign up to get started with RevologyAnalytics" 
                : "Sign in to your RevologyAnalytics account"}
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create account" : "Sign in"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
                  Test accounts
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p><strong>Email:</strong> armin@revologyanalytics.com | <strong>Password:</strong> armin5</p>
              <p><strong>Email:</strong> monica@revologyanalytics.com | <strong>Password:</strong> monica6</p>
              <p><strong>Email:</strong> john@revologyanalytics.com | <strong>Password:</strong> john4</p>
              {creatingTestUsers && (
                <p className="flex items-center text-yellow-500">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Setting up test users...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive SEO Column */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 relative overflow-hidden">
        <SeoAnimatedBackground />
      </div>
    </div>
  );
}
