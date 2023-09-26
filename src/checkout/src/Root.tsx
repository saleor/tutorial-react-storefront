import { ErrorBoundary } from "react-error-boundary";
import { IntlProvider } from "react-intl";
import {
	type Client,
	Provider as UrqlProvider,
	cacheExchange,
	createClient,
	dedupExchange,
	fetchExchange,
} from "urql";

import { ToastContainer } from "react-toastify";
import { SaleorAuthProvider, useAuthChange } from "@saleor/auth-sdk/react";
import { useMemo, useState } from "react";
import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { alertsContainerProps } from "./hooks/useAlerts/consts";
import { RootViews } from "./views/RootViews";
import { useLocale } from "./hooks/useLocale";
import { DEFAULT_LOCALE } from "./lib/regions";
import { getQueryParams } from "./lib/utils/url";
import { PageNotFound } from "@/checkout/src/views/PageNotFound";
import { type AppEnv } from "@/checkout/src/providers/AppConfigProvider/types";
import { AppConfigProvider } from "@/checkout/src/providers/AppConfigProvider";

export interface RootProps {
	env: AppEnv;
}

export const Root = ({ env }: RootProps) => {
	const { saleorApiUrl } = getQueryParams();

	const saleorAuthClient = useMemo(() => createSaleorAuthClient({ saleorApiUrl }), [saleorApiUrl]);

	const makeUrqlClient = () =>
		createClient({
			url: saleorApiUrl,
			suspense: true,
			requestPolicy: "cache-first",
			fetch: saleorAuthClient.fetchWithAuth,
			exchanges: [dedupExchange, cacheExchange, fetchExchange],
		});

	const { locale, messages } = useLocale();

	const [urqlClient, setUrqlClient] = useState<Client>(makeUrqlClient());
	useAuthChange({
		saleorApiUrl,
		onSignedOut: () => setUrqlClient(makeUrqlClient()),
		onSignedIn: () => setUrqlClient(makeUrqlClient()),
	});

	if (!saleorApiUrl) {
		console.warn(`Missing "saleorApiUrl" query param!`);
		return null;
	}

	if (!urqlClient) {
		console.warn(`Couldn't create URQL client!`);
		return null;
	}

	return (
		<IntlProvider defaultLocale={DEFAULT_LOCALE} locale={locale} messages={messages}>
			<SaleorAuthProvider client={saleorAuthClient}>
				<UrqlProvider value={urqlClient}>
					<AppConfigProvider env={env}>
						<div className="app">
							<ToastContainer {...alertsContainerProps} />
							<ErrorBoundary FallbackComponent={PageNotFound}>
								<RootViews />
							</ErrorBoundary>
						</div>
					</AppConfigProvider>
				</UrqlProvider>
			</SaleorAuthProvider>
		</IntlProvider>
	);
};
