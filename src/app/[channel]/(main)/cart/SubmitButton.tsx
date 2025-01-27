"use client";

import { useFormStatus } from "react-dom";

export const SubmitButton = () => {
	const { pending } = useFormStatus();

	return (
		<button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900" aria-disabled={pending}>
			{pending ? "Removing" : "Remove"}
			<span className="sr-only">line from cart</span>
		</button>
	);
};
