import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://zbcuqftgeulqjexgasjn.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiY3VxZnRnZXVscWpleGdhc2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxODQxOTYsImV4cCI6MjA0MDc2MDE5Nn0.JMr6ZjCgONZCIfZYtWZaY4geRlNjZwA5NQGEnCf3ydE";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
