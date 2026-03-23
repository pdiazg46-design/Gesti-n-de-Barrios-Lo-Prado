import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    const { data: p } = await supabase.from('profiles').select('id').limit(1);
    if (!p || !p.length) return NextResponse.json({error: 'no profiles'});
    
    const res1 = await supabase.from('notifications').insert([{user_id: p[0].id, type: 'DEBUG', title: 'test', message: 'test'}]);
    const res2 = await supabase.from('notifications').insert([{user_id: p[0].id, type: 'MARKET_ALERT', title: 'test', message: 'test'}]);
    const res3 = await supabase.from('notifications').insert([{user_id: p[0].id, type: 'SYSTEM_ALERT', title: 'test', message: 'test'}]);
    
    return NextResponse.json({res1, res2, res3});
}
