import { Button } from "@/checkout-storefront/components/Button";
import { TextInput } from "@/checkout-storefront/components/TextInput";
import { useErrorMessages } from "@/checkout-storefront/hooks/useErrorMessages";
import { UseErrors } from "@/checkout-storefront/hooks/useErrors";
import { useFormattedMessages } from "@/checkout-storefront/hooks/useFormattedMessages";
import { useGetInputProps } from "@/checkout-storefront/hooks/useGetInputProps";
import { useSetFormErrors } from "@/checkout-storefront/hooks/useSetFormErrors";
import { AddressField } from "@/checkout-storefront/lib/globalTypes";
import { TrashIcon } from "@/checkout-storefront/icons";
import { useValidationResolver } from "@/checkout-storefront/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { DefaultValues, Path, PathValue, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { object, string } from "yup";
import { AddressFormData } from "./types";
import { Select } from "@saleor/ui-kit";
import { Title } from "@/checkout-storefront/components/Title";
import { useAddressFormUtils } from "./useAddressFormUtils";
import { IconButton } from "@/checkout-storefront/components";
import { getSvgSrc } from "@/checkout-storefront/lib/svgSrc";
import {
  emptyFormData,
  isMatchingAddressFormData,
} from "@/checkout-storefront/sections/Addresses/utils";
import { difference, isEqual } from "lodash-es";
import { useCheckoutFormValidationTrigger } from "@/checkout-storefront/hooks/useCheckoutFormValidationTrigger";
import { useFormDebouncedSubmit } from "@/checkout-storefront/hooks/useFormDebouncedSubmit";
import { useCountrySelectProps } from "./useCountrySelectProps";
import { CountryCode } from "@/checkout-storefront/graphql";

export interface AddressFormProps<TFormData extends AddressFormData>
  extends Omit<UseErrors<TFormData>, "setApiErrors"> {
  defaultValues?: TFormData;
  onCancel?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  onSubmit: SubmitHandler<TFormData>;
  autoSave?: boolean;
  title: string;
  checkAddressAvailability?: boolean;
}

export const AddressForm = <TFormData extends AddressFormData>({
  defaultValues = emptyFormData as TFormData,
  onCancel,
  onSubmit,
  errors,
  clearErrors: onClearErrors,
  autoSave = false,
  onDelete,
  loading = false,
  title,
  checkAddressAvailability = false,
}: AddressFormProps<TFormData>) => {
  const formatMessage = useFormattedMessages();
  const { errorMessages } = useErrorMessages();
  const defaultValuesRef = useRef<TFormData>(defaultValues);
  const { initialCountryCode, countryOptions } = useCountrySelectProps({
    defaultFormData: defaultValues,
    checkAddressAvailability,
  });

  const schema = object({
    firstName: string().required(errorMessages.required),
    lastName: string().required(errorMessages.required),
    streetAddress1: string().required(errorMessages.required),
    postalCode: string().required(errorMessages.required),
    city: string().required(errorMessages.required),
    cityArea: string(),
    countryArea: string(),
    countryCode: string(),
  });

  const resolver = useValidationResolver(schema);

  const formProps = useForm<TFormData>({
    resolver: resolver as unknown as Resolver<TFormData, any>,
    mode: "onChange",
    defaultValues: {
      ...(defaultValues as DefaultValues<TFormData>),
      countryCode: initialCountryCode,
    },
  });

  const { handleSubmit, getValues, setError, clearErrors, watch, trigger, setValue, formState } =
    formProps;

  useCheckoutFormValidationTrigger(trigger);

  useSetFormErrors({ setError, errors });

  const getInputProps = useGetInputProps(formProps);
  const countryCode = watch("countryCode" as Path<TFormData>) as CountryCode;

  const {
    orderedAddressFields,
    getFieldLabel,
    isRequiredField,
    countryAreaChoices,
    allowedFields,
  } = useAddressFormUtils(countryCode);

  const allowedFieldsRef = useRef<AddressField[]>(allowedFields || []);

  const handleCancel = useCallback(() => {
    clearErrors();
    onClearErrors();

    if (typeof onCancel === "function") {
      onCancel();
    }
  }, [clearErrors, onClearErrors, onCancel]);

  const hasDataChanged = useCallback(
    (formData: TFormData) => !isMatchingAddressFormData(formData, defaultValuesRef.current),
    []
  );

  const handleOnSubmit = useCallback(
    (formData: TFormData) => {
      if (hasDataChanged(formData)) {
        onSubmit(formData);
        return;
      }

      handleCancel();
    },
    [onSubmit, handleCancel, hasDataChanged]
  );

  const debouncedSubmit = useFormDebouncedSubmit<TFormData>({
    autoSave,
    defaultFormData: defaultValues,
    formData: watch(),
    trigger,
    onSubmit: handleOnSubmit,
    formState,
  });

  const handleChange = () => {
    if (!autoSave) {
      return;
    }

    debouncedSubmit(getValues());
  };

  useEffect(() => {
    if (!hasDataChanged(defaultValues)) {
      return;
    }

    defaultValuesRef.current = defaultValues;
  }, [defaultValues, hasDataChanged]);

  // prevents outdated data to remain in the form when a field is
  // no longer allowed
  useEffect(() => {
    const removedFields = difference(allowedFieldsRef.current, allowedFields);

    removedFields.forEach((field) => {
      setValue(
        field as Path<TFormData>,
        emptyFormData[field as Path<TFormData>] as PathValue<TFormData, Path<TFormData>>
      );
    });
  }, [allowedFields, setValue]);

  return (
    <form>
      <div className="flex flex-row justify-between items-baseline">
        <Title>{title}</Title>
        <Select
          width="1/2"
          options={countryOptions}
          {...getInputProps("countryCode" as Path<TFormData>, { onChange: handleChange })}
        />
      </div>
      <div className="mt-2">
        {orderedAddressFields.map((field: AddressField) => {
          const isRequired = isRequiredField(field);
          const label = getFieldLabel(field);

          if (field === "countryArea" && isRequired) {
            return (
              <Select
                {...getInputProps("countryArea" as Path<TFormData>, { onChange: handleChange })}
                classNames={{ container: "mb-4" }}
                placeholder={getFieldLabel("countryArea")}
                options={
                  countryAreaChoices?.map(({ verbose, raw }) => ({
                    label: verbose as string,
                    value: raw as string,
                  })) || []
                }
              />
            );
          }

          return (
            <TextInput
              key={field}
              label={label}
              {...getInputProps(field as Path<TFormData>, {
                onChange: handleChange,
              })}
              optional={!isRequired}
            />
          );
        })}
        {!autoSave && (
          <div className="flex flex-row justify-end">
            {onDelete && (
              <IconButton
                className="mr-2"
                ariaLabel={formatMessage("deleteAddressLabel")}
                onClick={onDelete}
                icon={<img src={getSvgSrc(TrashIcon)} alt="" />}
              />
            )}

            <Button
              className="mr-2"
              ariaLabel={formatMessage("cancelLabel")}
              variant="secondary"
              onClick={handleCancel}
              label={formatMessage("cancel")}
            />
            {loading ? (
              <Button
                disabled
                ariaLabel={formatMessage("saveLabel")}
                onClick={handleSubmit(handleOnSubmit)}
                label={formatMessage("processing")}
              />
            ) : (
              <Button
                ariaLabel={formatMessage("saveLabel")}
                onClick={handleSubmit(handleOnSubmit)}
                label={formatMessage("saveAddress")}
              />
            )}
          </div>
        )}
      </div>
    </form>
  );
};
