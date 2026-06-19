import type { IPaymentProduct, TBillingFrequency, TProductBillingFrequency } from "@plane/types";
import { EProductSubscriptionEnum } from "@plane/types";

/**
 * Default billing frequency for each product subscription type
 */
export const DEFAULT_PRODUCT_BILLING_FREQUENCY: TProductBillingFrequency = {
  [EProductSubscriptionEnum.FREE]: undefined,
  [EProductSubscriptionEnum.ONE]: undefined,
  [EProductSubscriptionEnum.PRO]: undefined,
  [EProductSubscriptionEnum.BUSINESS]: undefined,
  [EProductSubscriptionEnum.ENTERPRISE]: undefined,
};

/**
 * Subscription types that support billing frequency toggle (monthly/yearly)
 */
export const SUBSCRIPTION_WITH_BILLING_FREQUENCY: EProductSubscriptionEnum[] = [];

/**
 * Pricing/products have been removed in the ScaleX build.
 */
export const PLANE_COMMUNITY_PRODUCTS: Record<string, IPaymentProduct> = {};

/**
 * URL for the "Talk to Sales" page where users can contact sales team
 */
export const TALK_TO_SALES_URL = "";

/**
 * Mapping of subscription types to their respective upgrade/redirection URLs based on billing frequency
 */
export const SUBSCRIPTION_REDIRECTION_URLS: Record<EProductSubscriptionEnum, Record<TBillingFrequency, string>> = {
  [EProductSubscriptionEnum.FREE]: { month: "", year: "" },
  [EProductSubscriptionEnum.ONE]: { month: "", year: "" },
  [EProductSubscriptionEnum.PRO]: { month: "", year: "" },
  [EProductSubscriptionEnum.BUSINESS]: { month: "", year: "" },
  [EProductSubscriptionEnum.ENTERPRISE]: { month: "", year: "" },
};

/**
 * Mapping of subscription types to their respective marketing webpage URLs
 */
export const SUBSCRIPTION_WEBPAGE_URLS: Record<EProductSubscriptionEnum, string> = {
  [EProductSubscriptionEnum.FREE]: "",
  [EProductSubscriptionEnum.ONE]: "",
  [EProductSubscriptionEnum.PRO]: "",
  [EProductSubscriptionEnum.BUSINESS]: "",
  [EProductSubscriptionEnum.ENTERPRISE]: "",
};
