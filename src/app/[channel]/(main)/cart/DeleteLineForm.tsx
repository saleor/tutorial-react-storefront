import { SubmitButton } from "./SubmitButton";
import { deleteLineFromCheckout } from "./actions";

type Props = {
	lineId: string;
	checkoutId: string;
};

export const DeleteLineForm = ({ lineId, checkoutId }: Props) => {
	return (
		<form action={deleteLineFromCheckout}>
			<input type="hidden" name="checkoutId" value={checkoutId} />
			<input type="hidden" name="lineId" value={lineId} />
			<SubmitButton />
		</form>
	);
};
