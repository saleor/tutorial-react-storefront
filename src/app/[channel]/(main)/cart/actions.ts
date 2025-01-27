"use server";

import { revalidatePath } from "next/cache";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutDeleteLinesDocument } from "@/gql/graphql";

export const deleteLineFromCheckout = async (formData: FormData) => {
	const lineId = formData.get("lineId")?.toString();
	const checkoutId = formData.get("checkoutId")?.toString();

	try {
		if (!checkoutId || !lineId) {
			throw Error("Missing `lineId and/or `checkoutId`.");
		}

		await executeGraphQL(CheckoutDeleteLinesDocument, {
			variables: {
				checkoutId,
				lineIds: [lineId],
			},
			cache: "no-cache",
		});
	} catch (e) {
		// TODO: handle erorrs
	}

	revalidatePath("/cart");
};
