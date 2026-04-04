import { createClient } from "@/lib/supabase/client";

// ============================================
// Plan Configuration
// ============================================

export type PlanType = "free" | "basic" | "pro";

export type PlanLimits = {
  maxWallets: number;
  maxCategories: number;
  maxBudgets: number;
  milestones: boolean;
  exportData: boolean;
  advancedAnalytics: boolean;
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxWallets: 2,
    maxCategories: 3,
    maxBudgets: 2,
    milestones: false,
    exportData: false,
    advancedAnalytics: false,
  },
  basic: {
    maxWallets: 2,
    maxCategories: 3,
    maxBudgets: 2,
    milestones: false,
    exportData: false,
    advancedAnalytics: false,
  },
  pro: {
    maxWallets: Infinity,
    maxCategories: Infinity,
    maxBudgets: Infinity,
    milestones: true,
    exportData: true,
    advancedAnalytics: true,
  },
};

export const PLAN_DETAILS = {
  basic: {
    name: "Santuy Basic",
    price: 0,
    priceLabel: "Gratis",
    period: "Selamanya",
    description: "Cukup buat mulai atur uang santuy.",
  },
  pro: {
    name: "Santuy Pro",
    price: 29000,
    priceLabel: "Rp29.000",
    period: "/bulan",
    description: "Fitur lengkap untuk manajemen santuy level pro.",
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Normalize plan name: 'free' is treated as 'basic'
 */
export function normalizePlan(plan: string | null | undefined): "basic" | "pro" {
  if (plan === "pro") return "pro";
  return "basic"; // free, basic, null, undefined → all treated as basic
}

/**
 * Get plan limits for a given plan
 */
export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  const normalized = normalizePlan(plan);
  return PLAN_LIMITS[normalized];
}

/**
 * Check if user has reached the limit for a specific countable feature
 */
export function hasReachedLimit(
  plan: string | null | undefined,
  feature: "maxWallets" | "maxCategories" | "maxBudgets",
  currentCount: number
): boolean {
  const limits = getPlanLimits(plan);
  return currentCount >= limits[feature];
}

/**
 * Check if user can access a boolean feature
 */
export function canAccessFeature(
  plan: string | null | undefined,
  feature: "milestones" | "exportData" | "advancedAnalytics"
): boolean {
  const limits = getPlanLimits(plan);
  return limits[feature];
}

/**
 * Check if user is on Pro plan
 */
export function isPro(plan: string | null | undefined): boolean {
  return normalizePlan(plan) === "pro";
}

/**
 * Fetch user plan from Supabase (client-side)
 */
export async function getUserPlan(): Promise<"basic" | "pro"> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return "basic";

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  return normalizePlan(profile?.plan);
}
