import {
	type CheckoutAuthorizeStatusEnum,
	type CheckoutChargeStatusEnum,
	type OrderAuthorizeStatusEnum,
	type OrderChargeStatusEnum,
} from "@/checkout/graphql";
import { getUrl } from "@/checkout/lib/utils/url";
import { type PaymentStatus } from "@/checkout/sections/PaymentSection/types";

export const getUrlForTransactionInitialize = () => getUrl({ query: { processingPayment: true } });

export const usePaymentStatus = ({
	chargeStatus,
	authorizeStatus,
}: {
	chargeStatus: CheckoutChargeStatusEnum | OrderChargeStatusEnum;
	authorizeStatus: CheckoutAuthorizeStatusEnum | OrderAuthorizeStatusEnum;
}): PaymentStatus => {
	if (chargeStatus === "NONE" && authorizeStatus === "FULL") {
		return "authorized";
	}

	if (chargeStatus === "FULL") {
		return "paidInFull";
	}

	if (chargeStatus === "OVERCHARGED") {
		return "overpaid";
	}

	return "none";
};
