import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CalculateEmiParams } from "./schema";

export interface CalculateEmiResult {
  principal: number;
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
  message: string;
}

const DEFAULT_ANNUAL_INTEREST_RATE = 10.5;

/**
 * Called when the chat/voice agent invokes the "calculate_emi" API Function
 * mid-conversation. Standard reducing-balance EMI formula — no AI involved,
 * this is deterministic so the agent can quote a real number instead of a
 * vague range.
 */
export async function handleCalculateEmiFunction(
  params: CalculateEmiParams
): Promise<CalculateEmiResult> {
  const subsidy = params.subsidy_amount ?? 0;
  const downPayment = params.down_payment ?? 0;
  const annualRate = params.annual_interest_rate ?? DEFAULT_ANNUAL_INTEREST_RATE;

  const principal = Math.max(params.system_cost - subsidy - downPayment, 0);
  const monthlyRate = annualRate / 12 / 100;
  const n = params.tenure_months;

  const growth = Math.pow(1 + monthlyRate, n);
  const monthlyEmi = principal === 0 ? 0 : (principal * monthlyRate * growth) / (growth - 1);
  const totalPayment = monthlyEmi * n;
  const totalInterest = totalPayment - principal;

  if (params.customer_phone) {
    const supabase = getSupabaseServerClient();
    const existing = await supabase
      .from("leads")
      .select("id")
      .eq("phone", params.customer_phone)
      .maybeSingle();

    let leadId = existing.data?.id as string | undefined;
    if (!leadId) {
      const { data: created, error } = await supabase
        .from("leads")
        .insert({
          name: params.customer_name ?? null,
          phone: params.customer_phone,
          channel: "website",
        })
        .select("id")
        .single();
      if (error) throw error;
      leadId = created.id;
    }

    const { error: eventError } = await supabase.from("automation_events").insert({
      lead_id: leadId,
      step: "emi_calculated",
      status: "completed",
      detail: {
        system_cost: params.system_cost,
        subsidy_amount: subsidy,
        down_payment: downPayment,
        tenure_months: n,
        annual_interest_rate: annualRate,
        monthly_emi: Math.round(monthlyEmi),
      },
    });
    if (eventError) throw eventError;
  }

  return {
    principal: Math.round(principal),
    monthlyEmi: Math.round(monthlyEmi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    message: `Estimated EMI: ₹${Math.round(monthlyEmi).toLocaleString("en-IN")}/month over ${n} months (principal ₹${Math.round(principal).toLocaleString("en-IN")} after subsidy/down payment).`,
  };
}
