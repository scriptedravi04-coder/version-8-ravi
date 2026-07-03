// middleware/chatSecurity.ts

const BLOCKED_PATTERNS = [
  /[6-9]\d{9}/g,
  /(\+91|0091)[\s-]?\d{10}/g,
  /whatsapp\.com|wa\.me/gi,
  /t\.me\/|telegram\.me/gi,
  /instagram\.com\/(?!p\/)/gi,
  /[\w.-]+@[\w.-]+\.\w+/g,
  /meet\s*(me|us)\s*outside/gi,
  /direct\s*deal/gi,
  /personal\s*(contact|number|whatsapp)/gi,
  /call\s*me\s*(on|at)/gi,
];

export function scanMessage(content: string): { blocked: boolean; reason: string | null } {
  for (const p of BLOCKED_PATTERNS) {
    p.lastIndex = 0;
    if (p.test(content)) {
      p.lastIndex = 0;
      return { blocked: true, reason: 'Platform rules violation — personal contact sharing not allowed on YBEX.' };
    }
    p.lastIndex = 0;
  }
  return { blocked: false, reason: null };
}

export async function handleViolation(userId: string, messageId: string, threadId: string, supabase: any) {
  const { data: existing } = await supabase
    .from('user_violations')
    .select('violation_count')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const count = (existing?.violation_count || 0) + 1;
  let restrictionUntil = null;
  let isSuspended = false;

  if (count === 2) {
    restrictionUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  } else if (count >= 3) {
    isSuspended = true;
    await supabase.from('users').update({ is_suspended: true }).eq('id', userId);
  }

  await supabase.from('user_violations').insert({
    user_id: userId,
    violation_type: 'CONTACT_SHARING',
    message_id: messageId,
    thread_id: threadId,
    violation_count: count,
    restriction_until: restrictionUntil,
    is_suspended: isSuspended
  });

  return { count, restrictionUntil, isSuspended };
}
