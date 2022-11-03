import { AddressFormData } from "@/checkout-storefront/components/AddressForm/types";
import { Errors, useErrorMessages } from "@/checkout-storefront/hooks";
import { usePhoneNumberUtils } from "@/checkout-storefront/hooks/usePhoneNumberUtils";
import { getErrorsAsObject, getAllValidationErrors } from "@/checkout-storefront/lib/utils";
import { useCallback } from "react";
import { object, string, ValidationError as YupValidationErrorObject } from "yup";

interface ResolverResult {
  errors: Errors<AddressFormData>;
  values: Partial<AddressFormData>;
}

export const useAddressFormValidationResolver = () => {
  const { errorMessages } = useErrorMessages();
  const { isValidNumber } = usePhoneNumberUtils();

  const schema = object({
    firstName: string().required(errorMessages.required),
    lastName: string().required(errorMessages.required),
    streetAddress1: string().required(errorMessages.required),
    streetAddress2: string(),
    companyName: string(),
    postalCode: string().required(errorMessages.required),
    city: string().required(errorMessages.required),
    cityArea: string(),
    countryArea: string(),
    phone: string().required(errorMessages.required),
  });

  return useCallback(
    async (data: AddressFormData) => {
      let result: ResolverResult = { errors: {}, values: {} };

      try {
        const values = await schema.validate(data, {
          abortEarly: false,
        });

        result = {
          ...result,
          values,
        };
      } catch (error) {
        const errors = getErrorsAsObject(getAllValidationErrors(error as YupValidationErrorObject));
        result = { ...result, errors };
      }

      const phoneRequiredError = result.errors?.phone?.type === "required";

      if (!isValidNumber(data.phone) && !phoneRequiredError) {
        result = {
          ...result,
          errors: {
            ...result.errors,
            phone: {
              type: "invalid",
              message: errorMessages.invalid,
            },
          },
        };
      }

      return result;
    },
    [schema, isValidNumber, errorMessages]
  );
};
