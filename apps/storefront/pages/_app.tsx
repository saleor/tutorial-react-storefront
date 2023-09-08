import "styles/globals.css";

import { ApolloProvider } from "@apollo/client";
import { NextPage } from "next";
import { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import React, { ReactElement, ReactNode } from "react";

import { DemoBanner } from "@/components/DemoBanner";
import { RegionsProvider } from "@/components/RegionsProvider";
import { BaseSeo } from "@/components/seo/BaseSeo";
import typePolicies from "@/lib/auth/typePolicies";
import { API_URI, DEMO_MODE } from "@/lib/const";
import { CheckoutProvider } from "@/lib/providers/CheckoutProvider";
import { SaleorAuthProvider, useAuthChange, useSaleorAuthClient } from "@saleor/auth-sdk/react";
import { useAuthenticatedApolloClient } from "@saleor/auth-sdk/react/apollo";
import { WishlistProvider } from "context/WishlistContext";
import { CartProvider } from "context/CartContext";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

  const useSaleorAuthClientProps = useSaleorAuthClient({
    saleorApiUrl: API_URI,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  });

  const { saleorAuthClient } = useSaleorAuthClientProps;

  const { apolloClient, reset, refetch } = useAuthenticatedApolloClient({
    fetchWithAuth: saleorAuthClient.fetchWithAuth,
    uri: API_URI,
    typePolicies,
  });

  useAuthChange({
    onSignedOut: () => reset(),
    onSignedIn: () => refetch(),
  });

  return (
    <SaleorAuthProvider {...useSaleorAuthClientProps}>
      <ApolloProvider client={apolloClient}>
        <CheckoutProvider>
          <RegionsProvider>
            <CartProvider>
              <WishlistProvider>
                <BaseSeo />
                <NextNProgress color="#fff" options={{ showSpinner: false }} />
                {DEMO_MODE && <DemoBanner />}
                {getLayout(<Component {...pageProps} />)}
              </WishlistProvider>
            </CartProvider>
          </RegionsProvider>
        </CheckoutProvider>
      </ApolloProvider>
    </SaleorAuthProvider>
  );
}

export default MyApp;
