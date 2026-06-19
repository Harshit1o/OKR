import { MessageSquare } from "lucide-react";
import { EProductSubscriptionEnum } from "@plane/types";
import { cn } from "@plane/utils";

export type TPlanFeatureData = React.ReactNode | boolean | null;

export type TPlanePlans = "free" | "one" | "pro" | "business" | "enterprise";

export type TPlanDetail = {
  id: EProductSubscriptionEnum;
  name: React.ReactNode;
  monthlyPrice?: number;
  yearlyPrice?: number;
  monthlyPriceSecondaryDescription?: React.ReactNode;
  yearlyPriceSecondaryDescription?: React.ReactNode;
  buttonCTA?: React.ReactNode;
  isActive: boolean;
};

type TPlanFeatureDetails = {
  title: React.ReactNode;
  description?: React.ReactNode;
  selfHostedDescription?: React.ReactNode;
  comingSoon?: boolean;
  selfHostedOnly?: boolean;
  cloud: Record<TPlanePlans, TPlanFeatureData>;
  "self-hosted"?: Record<TPlanePlans, TPlanFeatureData>;
};

type TPlansComparisonDetails = {
  id: string;
  title: React.ReactNode;
  comingSoon?: boolean;
  cloudOnly?: boolean;
  selfHostedOnly?: boolean;
  features: TPlanFeatureDetails[];
};

type PlanePlans = {
  planDetails: Record<TPlanePlans, TPlanDetail>;
  planHighlights: Record<TPlanePlans, string[]>;
  planComparison: TPlansComparisonDetails[];
};

export function ComingSoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "w-fit rounded-sm bg-accent-primary px-1.5 py-0.5 text-9 font-semibold whitespace-nowrap text-on-color",
        className
      )}
    >
      COMING SOON
    </span>
  );
}

// Used only as a small helper in legacy markup.
export function _ForumIcon({ className }: { className?: string }) {
  return <MessageSquare className={cn(className, "size-5 text-secondary")} />;
}

export const PLANS_LIST: TPlanePlans[] = [];

export const PLANS_COMPARISON_LIST: TPlansComparisonDetails[] = [];

const emptyPlanDetail: TPlanDetail = {
  id: EProductSubscriptionEnum.FREE,
  name: "",
  isActive: false,
};

export const PLANE_PLANS: PlanePlans = {
  planDetails: {
    free: { ...emptyPlanDetail, id: EProductSubscriptionEnum.FREE },
    one: { ...emptyPlanDetail, id: EProductSubscriptionEnum.ONE },
    pro: { ...emptyPlanDetail, id: EProductSubscriptionEnum.PRO },
    business: { ...emptyPlanDetail, id: EProductSubscriptionEnum.BUSINESS },
    enterprise: { ...emptyPlanDetail, id: EProductSubscriptionEnum.ENTERPRISE },
  },
  planHighlights: {
    free: [],
    one: [],
    pro: [],
    business: [],
    enterprise: [],
  },
  planComparison: PLANS_COMPARISON_LIST,
};
