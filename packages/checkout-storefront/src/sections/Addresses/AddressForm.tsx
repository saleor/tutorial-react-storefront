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
import { useEffect, useRef, useState } from "react";
import { DefaultValues, Path, Resolver, SubmitHandler, useForm } from "react-hook-form";
import { object, string } from "yup";
import { AddressFormData } from "./types";
import { Select } from "@saleor/ui-kit";
import { Title } from "@/checkout-storefront/components/Title";
import { UseCountrySelect } from "@/checkout-storefront/hooks/useErrors/useCountrySelect";
import { useAddressFormUtils } from "./useAddressFormUtils";
import { IconButton } from "@/checkout-storefront/components";
import { getSvgSrc } from "@/checkout-storefront/lib/svgSrc";
import { emptyFormData } from "@/checkout-storefront/sections/Addresses/utils";
import { isEqual } from "lodash-es";
import { useCheckoutFormValidationTrigger } from "@/checkout-storefront/hooks/useCheckoutFormValidationTrigger";
import { useFormAutofillSubmit } from "@/checkout-storefront/hooks/useFormAutofillSubmit";

export interface AddressFormProps<TFormData extends AddressFormData>
  extends Omit<UseErrors<TFormData>, "setApiErrors">,
    Pick<UseCountrySelect, "countryCode" | "setCountryCode" | "countryOptions"> {
  defaultValues?: Partial<TFormData>;
  onCancel?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  onSubmit: SubmitHandler<TFormData>;
  autoSave?: boolean;
  title: string;
}

export const AddressForm = <TFormData extends AddressFormData>({
  defaultValues = {},
  onCancel,
  onSubmit,
  errors,
  clearErrors: onClearErrors,
  autoSave = false,
  countryOptions,
  countryCode,
  setCountryCode,
  onDelete,
  loading = false,
  title,
}: AddressFormProps<TFormData>) => {
  const formatMessage = useFormattedMessages();
  const { errorMessages } = useErrorMessages();
  const [countryArea, setCountryArea] = useState<string>(defaultValues.countryArea || "");
  const defaultValuesRef = useRef<Partial<TFormData> | undefined>(defaultValues);
  const { validationRules } = useAddressFormUtils(countryCode);

  const schema = object({
    firstName: string().required(errorMessages.required),
    lastName: string().required(errorMessages.required),
    streetAddress1: string().required(errorMessages.required),
    postalCode: string().required(errorMessages.required),
    city: string().required(errorMessages.required),
    cityArea: string(),
    countryArea: string(),
  });

  const resolver = useValidationResolver(schema);

  const formProps = useForm<TFormData>({
    resolver: resolver as unknown as Resolver<TFormData, any>,
    mode: "onBlur",
    defaultValues: defaultValues as DefaultValues<TFormData>,
  });

  const {
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    reset,
    watch,
    trigger,
    formState: { isDirty },
  } = formProps;

  useCheckoutFormValidationTrigger(trigger);

  useSetFormErrors({ setError, errors });

  const getInputProps = useGetInputProps(formProps);

  const { orderedAddressFields, getFieldLabel, isRequiredField, countryAreaChoices } =
    useAddressFormUtils(countryCode);

  const handleCancel = () => {
    clearErrors();
    onClearErrors();

    if (onCancel) {
      onCancel();
    }
  };

  const hasDataChanged = (formData: TFormData) => !isEqual(formData, defaultValuesRef.current);

  const onSubmitWithDataChangeEnsured = (formData: TFormData) => {
    console.log(formData, defaultValuesRef.current, hasDataChanged, isDirty);
    if (!hasDataChanged(formData) || !isDirty) {
      return;
    }

    onSubmit({ ...formData, countryCode, isDirty });
  };

  const handleSave = (address: TFormData) => {
    onClearErrors();
    if (hasDataChanged(address)) {
      onSubmitWithDataChangeEnsured(
        countryArea ? { ...address, countryCode, countryArea } : { ...address, countryCode }
      );
    } else if (typeof onCancel === "function") {
      onCancel();
    }
  };

  const debouncedSubmit = useFormAutofillSubmit({
    defaultFormData: defaultValues,
    formData: { ...watch(), countryCode },
    trigger,
    onSubmit: onSubmitWithDataChangeEnsured,
  });

  useEffect(() => {
    if (isEqual(defaultValues, defaultValuesRef.current)) {
      return;
    }

    const dataToSet = !Object.keys(defaultValues).length ? emptyFormData : defaultValues;

    reset(dataToSet as TFormData);

    defaultValuesRef.current = defaultValues;
  }, [defaultValues]);

  return (
    <>
      <div className="flex flex-row justify-between items-baseline">
        <Title>{title}</Title>
        <Select
          classNames={{ container: "!w-1/2" }}
          onChange={setCountryCode}
          selectedValue={countryCode}
          options={countryOptions}
        />
      </div>
      <div className="mt-2">
        {orderedAddressFields.map((field: AddressField) => {
          const isRequired = isRequiredField(field);
          const label = getFieldLabel(field);

          if (field === "countryArea" && isRequired) {
            return (
              <Select
                classNames={{ container: "mb-4" }}
                placeholder={label}
                onChange={setCountryArea}
                selectedValue={countryArea}
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
                onBlur: () => {
                  if (!autoSave) {
                    return;
                  }
                  debouncedSubmit({ ...getValues(), countryCode });
                },
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
                onClick={handleSubmit(handleSave)}
                label={formatMessage("processing")}
              />
            ) : (
              <Button
                ariaLabel={formatMessage("saveLabel")}
                onClick={handleSubmit(handleSave)}
                label={formatMessage("saveAddress")}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};
