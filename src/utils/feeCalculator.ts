import { SupabaseClient } from '@supabase/supabase-js';

export async function calculateFee(grossAmount: number, supabase: SupabaseClient) {
  const { data: config, error } = await supabase
    .from('platform_fee_config')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !config) {
    // Fallback if table is empty or error
    console.error("Fee config error, using fallback", error);
    const rate = grossAmount <= 20000 ? 5 : 2;
    const platformFee = (grossAmount * rate) / 100;
    const gst = platformFee * 0.18;
    const creatorNet = grossAmount - platformFee;
    return { grossAmount, feePercent: rate, platformFee: Math.round(platformFee), gstAmount: Math.round(gst), creatorNet: Math.round(creatorNet) };
  }

  const rate = grossAmount <= config.threshold_amount
    ? config.below_threshold_rate   // 5% for deals <= ₹20,000
    : config.above_threshold_rate;  // 2% for deals > ₹20,000

  const platformFee = (grossAmount * rate) / 100;
  const gst = platformFee * 0.18;        // 18% GST on platform fee
  const creatorNet = grossAmount - platformFee;

  return {
    grossAmount,
    feePercent: rate,
    platformFee: Math.round(platformFee),
    gstAmount: Math.round(gst),
    creatorNet: Math.round(creatorNet)
  };
}
