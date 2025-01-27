import React from "react";
import { type ParsedDummyGateway } from "../types";
import { apiErrorMessages } from "../errorMessages";
import {
	useTransactionInitializeMutation,
	type TransactionInitializeMutationVariables,
} from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useSubmit } from "@/checkout/hooks/useSubmit";
import { Button } from "@/checkout/components";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";

type DummyDropinProps = {
	config: ParsedDummyGateway;
};

const useDummyDropIn = (props: DummyDropinProps) => {
	const { showCustomErrors } = useAlerts();
	const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);

	const { checkout } = useCheckout();
	const { onCheckoutComplete, completingCheckout: isCompleteCheckoutLoading } = useCheckoutComplete();

	const [{ fetching: isTransactionInitializeLoading }, transactionInitialize] =
		useTransactionInitializeMutation();

	const isLoading = isCompleteCheckoutLoading || isTransactionInitializeLoading;
	const isValid = !!checkout.shippingAddress && !!checkout.email && !!checkout.billingAddress;

	const isDisabled = isLoading || !isValid;

	const onTransactionInitialize = useSubmit<
		TransactionInitializeMutationVariables,
		typeof transactionInitialize
	>(
		React.useMemo(
			() => ({
				onSubmit: transactionInitialize,
				onError: (error) => {
					console.error(error);
					showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
				},
				onSuccess: async () => {
					void onCheckoutComplete();
				},
			}),
			[commonErrorMessages.somethingWentWrong, onCheckoutComplete, showCustomErrors, transactionInitialize],
		),
	);

	const onSubmit = async () => {
		await onTransactionInitialize({
			checkoutId: checkout.id,
			paymentGateway: {
				id: props.config.id,
			},
		});
	};

	return { onSubmit, isLoading, isDisabled };
};

export const DummyDropIn = (props: DummyDropinProps) => {
	const { onSubmit, isLoading, isDisabled } = useDummyDropIn(props);

	return (
		<div className="border-2 border-dashed p-4">
			<h2 className="text-lg font-semibold text-gray-800">Dummy Payment Gateway</h2>
			{/* <h3 className="text-sm font-semibold text-gray-600" data-testid="dummy-payment-gateway-name">
				Stored payment methods
			</h3> */}
			<Button disabled={isDisabled} label={isLoading ? "Loading..." : "Pay with 🤪"} onClick={onSubmit} />
		</div>
	);
};
