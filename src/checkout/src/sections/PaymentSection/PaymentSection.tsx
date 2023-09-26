import { Divider } from "@/checkout/src/components/Divider";
import { Title } from "@/checkout/src/components/Title";
import { useFormattedMessages } from "@/checkout/src/hooks/useFormattedMessages";
import { PaymentMethods } from "./PaymentMethods";
import React from "react";
import { type Children } from "@/checkout/src/lib/globalTypes";
import { paymentSectionMessages } from "./messages";

export const PaymentSection: React.FC<Children> = ({ children }) => {
  const formatMessage = useFormattedMessages();

  return (
    <>
      <Divider />
      <div className="section" data-testid="paymentMethods">
        <Title>{formatMessage(paymentSectionMessages.paymentMethods)}</Title>
        <PaymentMethods />
        {children}
      </div>
    </>
  );
};
