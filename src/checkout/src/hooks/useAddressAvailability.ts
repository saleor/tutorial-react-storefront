import { useCallback } from "react";
import { type CountryCode } from "@/checkout/src/graphql";
import { useAvailableShippingCountries } from "@/checkout/src/hooks/useAvailableShippingCountries";

export const useAddressAvailability = (skipCheck = false) => {
	const { availableShippingCountries } = useAvailableShippingCountries();

	const isAvailable = useCallback(
		({ country }: { country: { code: string } }) => {
			if (skipCheck) {
				return true;
			}

			return availableShippingCountries.includes(country?.code as CountryCode);
		},
		[skipCheck, availableShippingCountries],
	);

	return { isAvailable, availableShippingCountries };
};
