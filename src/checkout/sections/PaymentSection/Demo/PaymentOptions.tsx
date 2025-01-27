import type { FormEventHandler } from "react";
import { useCheckoutValidationActions } from "@/checkout/state/checkoutValidationStateStore";
import { useUser } from "@/checkout/hooks/useUser";
import { useCheckoutUpdateStateActions } from "@/checkout/state/updateStateStore";
import { useEvent } from "@/checkout/hooks/useEvent";
import { useCheckoutCompleteMutation, useTransactionInitializeMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { replaceUrl } from "@/checkout/lib/utils/url";
import { Button } from "@/checkout/components";
import { DEMO_PAYMENT_GATEWAY } from "@/checkout/sections/PaymentSection/Demo/metadata";

export const DemoPayment = () => {
	const { checkout } = useCheckout();
	const { authenticated } = useUser();
	const { validateAllForms } = useCheckoutValidationActions();
	const { setSubmitInProgress, setShouldRegisterUser } = useCheckoutUpdateStateActions();
	const [__, mutation] = useTransactionInitializeMutation();
	const [_, completeMutation] = useCheckoutCompleteMutation();
	const onSubmit: FormEventHandler<HTMLFormElement> = useEvent(async (e) => {
		e.preventDefault();
		validateAllForms(authenticated);
		setShouldRegisterUser(true);
		setSubmitInProgress(true);
		await mutation({
			checkoutId: checkout.id,
			paymentGateway: {
				id: DEMO_PAYMENT_GATEWAY,
				data: {
					details: "valid-details",
				},
			},
		});
		const { data } = await completeMutation({
			checkoutId: checkout.id,
		});

		const order = data?.checkoutComplete?.order;

		if (order) {
			const newUrl = replaceUrl({
				query: {
					order: order.id,
				},
				replaceWholeQuery: true,
			});
			window.location.href = newUrl;
		}
	});

	return (
		<form onSubmit={onSubmit}>
			{/* eslint-disable-next-line react/jsx-no-undef */}
			<button type={"submit"}>
				<Button label={"Pay"} />
			</button>
		</form>
	);
};
