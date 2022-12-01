import create from "zustand";
import { CheckoutScope } from "@/checkout-storefront/hooks/useAlerts";
import shallow from "zustand/shallow";
import { useMemo } from "react";
import { memoize, omit } from "lodash-es";

export type CheckoutUpdateStateStatus = "idle" | "success" | "loading" | "error";

export type CheckoutUpdateStateScope = Extract<
  CheckoutScope,
  | "checkoutShippingUpdate"
  | "checkoutCustomerAttach"
  | "checkoutAddPromoCode"
  | "checkoutDeliveryMethodUpdate"
  | "checkoutEmailUpdate"
  | "checkoutBillingUpdate"
  | "checkoutLinesUpdate"
  | "userRegister"
>;

interface CheckoutUpdateStateStore {
  shouldRegisterUser: boolean;
  loadingCheckout: boolean;
  updateState: Record<CheckoutUpdateStateScope, CheckoutUpdateStateStatus>;
  actions: {
    setShouldRegisterUser: (shouldRegisterUser: boolean) => void;
    setLoadingCheckout: (loading: boolean) => void;
    setUpdateState: (
      scope: CheckoutUpdateStateScope
    ) => (status: CheckoutUpdateStateStatus) => void;
  };
}

export const useCheckoutUpdateStateStore = create<CheckoutUpdateStateStore>((set) => ({
  shouldRegisterUser: false,
  loadingCheckout: false,
  updateState: {
    checkoutShippingUpdate: "idle",
    checkoutCustomerAttach: "idle",
    checkoutBillingUpdate: "idle",
    checkoutAddPromoCode: "idle",
    checkoutDeliveryMethodUpdate: "idle",
    checkoutLinesUpdate: "idle",
    checkoutEmailUpdate: "idle",
    userRegister: "idle",
  },
  actions: {
    setShouldRegisterUser: (shouldRegisterUser: boolean) =>
      set(() => ({
        shouldRegisterUser,
      })),
    setLoadingCheckout: (loading: boolean) => set(() => ({ loadingCheckout: loading })),
    setUpdateState: memoize(
      (scope) => (status) =>
        set((state) => ({
          updateState: {
            ...state.updateState,
            [scope]: status,
          },
          // checkout will reload right after, this ensures there
          // are no rerenders in between where there's no state updating
          // also we might not need this once we get better caching
          loadingCheckout: status === "success",
        }))
    ),
  },
}));

export const useCheckoutUpdateState = () => {
  const { updateState, loadingCheckout } = useCheckoutUpdateStateStore(
    ({ updateState, loadingCheckout }) => ({
      updateState,
      loadingCheckout,
    }),
    shallow
  );

  return useMemo(
    () => ({ updateState, loadingCheckout }),
    // because we want to compare array of strings instead of object
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingCheckout, ...Object.values(updateState)]
  );
};

export const useUserRegisterState = () => {
  const shouldUserRegister = useCheckoutUpdateStateStore((state) => state.shouldRegisterUser);
  return useMemo(() => shouldUserRegister, [shouldUserRegister]);
};

export const useCheckoutUpdateStateActions = () =>
  useCheckoutUpdateStateStore(({ actions }) => omit(actions, "setUpdateState"));

export const useCheckoutUpdateStateChange = (scope: CheckoutUpdateStateScope) =>
  useCheckoutUpdateStateStore(({ actions: { setUpdateState } }) => ({
    setCheckoutUpdateState: (status: CheckoutUpdateStateStatus) => {
      const updateState = setUpdateState(scope);
      updateState(status);
      if (status === "success") {
        setTimeout(() => {
          updateState("idle");
        }, 0);
      }
    },
  }));
