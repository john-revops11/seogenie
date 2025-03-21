
-- Functions for DataForSEO API caching and usage tracking

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  );
END;
$$;

-- Function to get all public tables
CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE(table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT tables.table_name::text
    FROM information_schema.tables
    WHERE table_schema = 'public';
END;
$$;

-- Function to create api_requests table
CREATE OR REPLACE FUNCTION public.create_api_requests_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.api_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_data JSONB NOT NULL,
    response_data JSONB NOT NULL,
    request_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.01
  );
  
  -- Add indexes
  CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON public.api_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_api_requests_request_hash ON public.api_requests(request_hash);
  CREATE INDEX IF NOT EXISTS idx_api_requests_expires_at ON public.api_requests(expires_at);
  
  -- Add RLS policies
  ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;
  
  -- Users can only see their own API requests
  DROP POLICY IF EXISTS "Users can view own api requests" ON public.api_requests;
  CREATE POLICY "Users can view own api requests" 
    ON public.api_requests 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);
  
  -- Users can only insert their own API requests
  DROP POLICY IF EXISTS "Users can insert own api requests" ON public.api_requests;
  CREATE POLICY "Users can insert own api requests" 
    ON public.api_requests 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);
    
  -- Create a function to aggregate API requests to daily usage
  CREATE OR REPLACE FUNCTION public.update_api_usage()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
  BEGIN
    INSERT INTO public.api_usage (
      user_id, 
      api_name, 
      usage_date, 
      request_count, 
      estimated_cost
    )
    VALUES (
      NEW.user_id, 
      'DataForSEO', 
      date_trunc('day', NEW.created_at), 
      1, 
      NEW.cost
    )
    ON CONFLICT (user_id, api_name, usage_date)
    DO UPDATE SET
      request_count = api_usage.request_count + 1,
      estimated_cost = api_usage.estimated_cost + NEW.cost;
    
    RETURN NEW;
  END;
  $$;
  
  -- Create trigger for the function
  DROP TRIGGER IF EXISTS update_api_usage_trigger ON public.api_requests;
  CREATE TRIGGER update_api_usage_trigger
  AFTER INSERT ON public.api_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_api_usage();
END;
$$;

-- Function to create api_usage table
CREATE OR REPLACE FUNCTION public.create_api_usage_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    api_name TEXT NOT NULL,
    usage_date DATE NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, api_name, usage_date)
  );
  
  -- Add indexes
  CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
  CREATE INDEX IF NOT EXISTS idx_api_usage_date ON public.api_usage(usage_date);
  
  -- Add RLS policies
  ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
  
  -- Users can only see their own API usage
  DROP POLICY IF EXISTS "Users can view own api usage" ON public.api_usage;
  CREATE POLICY "Users can view own api usage" 
    ON public.api_usage 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);
    
  -- Update timestamp function for updated_at
  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$;
  
  -- Create trigger for the function
  DROP TRIGGER IF EXISTS update_api_usage_updated_at ON public.api_usage;
  CREATE TRIGGER update_api_usage_updated_at
  BEFORE UPDATE ON public.api_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
END;
$$;

-- Function to store an API request
CREATE OR REPLACE FUNCTION public.store_api_request(
  p_user_id UUID,
  p_endpoint TEXT,
  p_request_data JSONB,
  p_response_data JSONB,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_request_hash TEXT,
  p_cost DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.api_requests (
    user_id,
    endpoint,
    request_data,
    response_data,
    expires_at,
    request_hash,
    cost
  ) VALUES (
    p_user_id,
    p_endpoint,
    p_request_data,
    p_response_data,
    p_expires_at,
    p_request_hash,
    p_cost
  );
END;
$$;

-- Function to get a cached API response
CREATE OR REPLACE FUNCTION public.get_cached_api_response(
  p_request_hash TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response JSONB;
BEGIN
  SELECT response_data INTO v_response
  FROM public.api_requests
  WHERE request_hash = p_request_hash
    AND user_id = p_user_id
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN v_response;
END;
$$;

-- Function to get DataForSEO usage
CREATE OR REPLACE FUNCTION public.get_dataforseo_usage(
  p_user_id UUID
)
RETURNS TABLE(
  total_cost DECIMAL,
  request_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(estimated_cost), 0) AS total_cost,
    COALESCE(SUM(request_count), 0) AS request_count
  FROM public.api_usage
  WHERE user_id = p_user_id
    AND api_name = 'DataForSEO';
END;
$$;
