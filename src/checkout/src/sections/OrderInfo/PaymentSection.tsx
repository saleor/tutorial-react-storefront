import { AlertIcon, SuccessIcon } from "../../assets/icons";
import { Section } from "./Section";
import { orderInfoMessages } from "./messages";
import { Text } from "@/checkout/ui-kit";

import { useFormattedMessages } from "@/checkout/src/hooks/useFormattedMessages";

import { useOrder } from "@/checkout/src/hooks/useOrder";
import { usePaymentStatus } from "@/checkout/src/sections/PaymentSection/utils";

const ErrorMessage = ({ message }: { message: string }) => {
	return (
		<>
			<Text color="error" className="mr-1">
				{message}
			</Text>
			<AlertIcon />
		</>
	);
};

const SuccessMessage = ({ message }: { message: string }) => {
	return (
		<>
			<Text color="success" className="mr-1">
				{message}
			</Text>
			<SuccessIcon />
		</>
	);
};

export const PaymentSection = () => {
	const formatMessage = useFormattedMessages();
	const { order } = useOrder();
	const paymentStatus = usePaymentStatus(order);

	return (
		<Section title={formatMessage(orderInfoMessages.paymentSection)}>
			<div data-testid="paymentStatus">
				<div className="flex flex-row items-center">
					{paymentStatus === "authorized" && (
						<SuccessMessage message={formatMessage(orderInfoMessages.orderAuthorized)} />
					)}

					{paymentStatus === "paidInFull" && (
						<SuccessMessage message={formatMessage(orderInfoMessages.orderPaid)} />
					)}

					{paymentStatus === "overpaid" && (
						<ErrorMessage message={formatMessage(orderInfoMessages.orderOvercharged)} />
					)}
				</div>
			</div>
		</Section>
	);
};
