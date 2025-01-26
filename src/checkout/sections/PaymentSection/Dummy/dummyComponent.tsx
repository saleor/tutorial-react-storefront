"use client";

import { useState } from "react";
import { apiErrorMessages } from "../errorMessages";
import { dummyGatewayId } from "./types";
import { useTransactionInitializeMutation } from "@/checkout/graphql";

import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { Button } from "@/checkout/components";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";

export const DummyComponent = () => {
	const [loading, setLoading] = useState(false);
	const { checkout } = useCheckout();
	const { deliveryMethod } = checkout;

	const { showCustomErrors } = useAlerts();
	const [, transactionInitialize] = useTransactionInitializeMutation();
	const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);
	const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();

	const pay = async () => {
		setLoading(true);

		transactionInitialize({
			checkoutId: checkout.id,
			paymentGateway: {
				id: dummyGatewayId,
				data: {
					event: {
						type: "CHARGE_SUCCESS",
						includePspReference: true,
					},
				},
			},
		}).catch((err) => {
			console.error(err);
			showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
		});

		void onCheckoutComplete();

		setLoading(false);
	};

	if (!deliveryMethod) {
		return null;
	}

	if (loading || completingCheckout) {
		return <p>Processing...</p>;
	}

	return <Button label="Pay with Dummy" onClick={pay} />;
};
