import { DEMO_PAYMENT_GATEWAY } from "@/checkout/sections/PaymentSection/Demo/metadata";

const removeWhiteSpace = (str: string): string => {
	return str.replaceAll(/[\t\n]+/g, " ");
};

const url = `https://${process.env.VERCEL_BRANCH_URL}`;

export async function GET() {
	return Response.json({
		id: DEMO_PAYMENT_GATEWAY,
		version: "1.0.0",
		requiredSaleorVersion: "^3.20",
		name: "Demo Payment App",
		author: "Storefront",
		about: "Demo for processing payments. Can be used for testing purposes.",

		permissions: ["HANDLE_PAYMENTS"],

		appUrl: `${url}`,
		configurationUrl: `${url}`,
		tokenTargetUrl: `${url}/api/demo-payment`,

		dataPrivacy: "",
		dataPrivacyUrl: `${url}`,
		homepageUrl: `${url}`,
		supportUrl: `${url}`,
		// brand: {
		// 	logo: {
		// 		default: [APP_ICON_URL],
		// 	},
		// },
		webhooks: [
			{
				name: "Transaction initialize",
				syncEvents: ["TRANSACTION_INITIALIZE_SESSION"],
				query: removeWhiteSpace(`
					subscription {
						event {
							... on TransactionInitializeSession {
								__typename
								data
								action {
									amount
									currency
									actionType
								}
								issuedAt
								merchantReference
								idempotencyKey
							}
						}
				}`),
				targetUrl: `${url}/api/demo-payment/transaction-initialize`,
				isActive: true,
			},
			{
				name: "Gateway initialize",
				syncEvents: ["PAYMENT_GATEWAY_INITIALIZE_SESSION"],
				query: removeWhiteSpace(`
				subscription {
					event {
						... on PaymentGatewayInitializeSession {
							__typename
							amount
							data
						}
					}
				}`),
				targetUrl: `${url}/api/demo-payment/gateway-initialize`,
				isActive: true,
			},
		],
	});
}

export async function POST(_: Request) {
	// During installation this path would be used to save app token that later can be used to authenticate requests. For example to manipulate checkout or orders.
	return new Response("Success!", {
		status: 200,
	});
}
