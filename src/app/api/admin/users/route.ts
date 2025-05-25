import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!serviceRoleKey || !supabaseUrl) {
  throw new Error('Missing Supabase service role key or URL');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function GET(req: NextRequest) {
  // Optionally, add admin email check here if you want
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const users = data.users.map(u => ({
    id: u.id,
    email: u.email,
    first_name: u.user_metadata?.first_name || '',
    last_name: u.user_metadata?.last_name || '',
    job_title: u.user_metadata?.job_title || '',
    product: u.user_metadata?.product || '',
  }));
  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}