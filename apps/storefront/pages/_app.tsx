import "styles/globals.css";

import { ApolloProvider } from "@apollo/client";
import { NextPage } from "next";
import { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import React, { ReactElement, ReactNode } from "react";

import { DemoBanner } from "@/components/DemoBanner";
import { RegionsProvider } from "@/components/RegionsProvider";
import { BaseSeo } from "@/components/seo/BaseSeo";
import { API_URI, DEMO_MODE } from "@/lib/const";
import { CheckoutProvider } from "@/lib/providers/CheckoutProvider";
import { SaleorAuthProvider, useAuthChange, useSaleorAuthClient } from "@saleor/auth-sdk/react";
import { useAuthenticatedApolloClient } from "@saleor/auth-sdk/react/apollo";

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

  // FIXME missing typePolicies in InMemoryCache
  const { apolloClient, reset } = useAuthenticatedApolloClient({
    fetchWithAuth: saleorAuthClient.fetchWithAuth,
    url: API_URI,
  });

  useAuthChange({
    onSignedOut: () => reset(),
    onSignedIn: () =>
      apolloClient.refetchQueries({
        include: ["User"],
      }),
  });

  return (
    <SaleorAuthProvider {...useSaleorAuthClientProps}>
      <ApolloProvider client={apolloClient}>
        <CheckoutProvider>
          <RegionsProvider>
            <BaseSeo />
            <NextNProgress color="#5B68E4" options={{ showSpinner: false }} />
            {DEMO_MODE && <DemoBanner />}
            {getLayout(<Component {...pageProps} />)}
          </RegionsProvider>
        </CheckoutProvider>
      </ApolloProvider>
    </SaleorAuthProvider>
  );
}

export default MyApp;
