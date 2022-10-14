import * as Sentry from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

import { verifyPayment } from "@/saleor-app-checkout/backend/payments/providers/mollie";
import { updateOrCreateTransaction } from "@/saleor-app-checkout/backend/payments/updateOrCreateTransaction";
import { unpackPromise, unpackThrowable } from "@/saleor-app-checkout/utils/unpackErrors";
import { getSaleorApiHostFromRequest } from "@/saleor-app-checkout/backend/auth";

/**
  Webhooks endpoint for mollie payment gateway.
  It's called after any change in the payment (paid, expired, failed, refunded, etc.)
  https://docs.mollie.com/overview/webhooks
*/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [saleorApiHostError, saleorApiHost] = unpackThrowable(() =>
    getSaleorApiHostFromRequest(req)
  );

  if (saleorApiHostError) {
    Sentry.captureException(saleorApiHostError);
    res.status(400).json({ message: saleorApiHostError.message });
    return;
  }

  const [paymentError, paymentData] = await unpackPromise(verifyPayment({ saleorApiHost, id }));

  if (paymentError) {
    console.error(paymentError);
    Sentry.captureException(paymentError);
    res.status(500).json({ error: "error while validating payment" });
    return;
  }
  // Save transaction id from mollie in Saleor
  // Check if transaction was already created in Saleor
  // If status of that transaction changed, update transaction in Saleor
  if (paymentData) {
    await updateOrCreateTransaction({
      saleorApiHost,
      orderId: paymentData.id,
      transactionData: paymentData,
    });

    res.status(200).send("ok");

    return;
  }
}

export default handler;
