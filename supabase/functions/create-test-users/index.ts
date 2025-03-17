
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables for Supabase connection");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test users to create
    const testUsers = [
      { email: "armin@revologyanalytics.com", password: "armin5" },
      { email: "monica@revologyanalytics.com", password: "monica6" },
      { email: "john@revologyanalytics.com", password: "john4" },
    ];
    
    const results = [];
    
    // Create each test user
    for (const user of testUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", user.email);
      
      if (existingUsers && existingUsers.length > 0) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }
      
      // Create the user if they don't exist
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });
      
      if (error) {
        results.push({ email: user.email, status: "error", message: error.message });
      } else {
        results.push({ email: user.email, status: "created", userId: data.user.id });
      }
    }
    
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
