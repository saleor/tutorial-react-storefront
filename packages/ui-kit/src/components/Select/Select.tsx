import {
  FocusEvent,
  ReactNode,
  SelectHTMLAttributes,
  SyntheticEvent,
  useRef,
  useState,
} from "react";
import clsx from "clsx";

import styles from "./Select.module.css";
import { ChevronDownIcon } from "../icons";
import { ClassNames } from "@lib/globalTypes";

export interface Option<TData extends string = string> {
  label: string | ReactNode;
  value: TData;
  disabled?: boolean;
  icon?: string | ReactNode;
  [key: string]: unknown;
}

export type SelectOnChangeHandler<TData extends string = string> = (value: TData) => void;

export interface SelectProps<TData extends string = string>
  extends SelectHTMLAttributes<HTMLSelectElement> {
  onChange: (event: SyntheticEvent) => void;
  options: Option<TData>[];
  error?: boolean;
  classNames?: ClassNames<
    "container" | "triggerIcon" | "trigger" | "triggerArrow" | "options" | "optionIcon" | "option"
  >;
}

export const Select = <TData extends string = string>({
  options,
  error,
  classNames,
  placeholder = "",
  value,
  onChange,
  onBlur,
  onFocus,
  ...rest
}: SelectProps<TData>) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  const handleChange = (event: SyntheticEvent) => {
    console.log("CHANGE DAMN");
    event.preventDefault();
    setIsOpen(!isOpen);
    onChange(event);
  };

  const handleBlur = (event: FocusEvent<HTMLSelectElement>) => {
    console.log("BLUR");
    setIsOpen(false);
    if (typeof onBlur === "function") {
      onBlur(event);
    }
  };

  const handleFocus = (event: FocusEvent<HTMLSelectElement>) => {
    console.log("FOCUS");
    setIsOpen(true);
    if (typeof onFocus === "function") {
      onFocus(event);
    }
  };

  const handleClick = (lol) => console.log("CLICK", ref.current);

  return (
    <div className={clsx(styles.container, classNames?.container)}>
      <select
        {...rest}
        ref={ref}
        onClick={handleClick}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={clsx(styles.select)}
      >
        {options.map(({ label, value, disabled = false }) => (
          <option value={value} disabled={disabled}>
            {label}
          </option>
        ))}
      </select>
      <div className={clsx(styles.icon, isOpen && styles["dropdown-open"])}>
        <ChevronDownIcon />
      </div>
      {/* <Combobox value={selectedOption} onChange={({ value }: Option<TData>) => onChange(value)}>
        <Combobox.Button
          className={clsx(
            styles.trigger,
            {
              [styles["trigger-error"]]: error,
              [styles["trigger-disabled"]]: disabled,
            },
            classNames?.trigger
          )}
        >
          {({ open }) => {
            return (
              <>
                {selectedOption?.icon && (
                  <div className={clsx(styles["trigger-icon"], classNames?.triggerIcon)}>
                    {selectedOption?.icon}
                  </div>
                )}
                {selectedOption?.label || placeholder}
                {!disabled && (
                  <span
                    className={clsx(
                      styles["arrow-container"],
                      {
                        [styles["arrow-container-open"]]: open,
                      },
                      classNames?.triggerArrow
                    )}
                  >
                    <ChevronDownIcon />
                  </span>
                )}
              </>
            );
          }}
        </Combobox.Button>
        {!disabled && (
          <Combobox.Options className={clsx(styles.options)}>
            {options.map((option) => (
              <Combobox.Option
                key={option.value}
                value={option}
                disabled={option.disabled}
                className={clsx(
                  styles.option,
                  classNames?.option,
                  option.disabled && styles.disabled
                )}
              >
                {option?.icon && (
                  <div className={clsx(styles["option-icon"], classNames?.optionIcon)}>
                    {option?.icon}
                  </div>
                )}
                {option.label}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </Combobox> */}
    </div>
  );
};
