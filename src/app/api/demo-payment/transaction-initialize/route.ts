export async function POST(req: Request) {
	const randomPspReference = crypto.randomUUID(); // Generate a random PSP reference
	const data = await req.json();
	console.log(data);
	return Response.json({
		result: "CHARGE_SUCCESS",
		amount: 10, // `payload` is typed thanks to the generated types
		pspReference: randomPspReference,
	});
}
