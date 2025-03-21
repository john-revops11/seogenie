
import { supabase } from "./config.ts";

// Initialize the required tables if they don't exist
export async function initializeDatabase() {
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }
    
    const tableNames = tables.map((t: any) => t.table_name);
    
    // Create api_requests table if it doesn't exist
    if (!tableNames.includes('api_requests')) {
      await supabase.rpc('create_api_requests_table');
    }
    
    // Create api_usage table if it doesn't exist
    if (!tableNames.includes('api_usage')) {
      await supabase.rpc('create_api_usage_table');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Check if a table exists
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      'check_table_exists',
      { table_name: tableName }
    );
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}
