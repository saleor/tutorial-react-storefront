"use client";

import { useFormStatus } from "react-dom";

export const LoginButton = () => {
	const { pending } = useFormStatus();
	return (
		<button
			className="mt-2 rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700 aria-disabled:opacity-80"
			type="submit"
			aria-disabled={pending}
		>
			{pending ? "Processing..." : "Log In"}
		</button>
	);
};
