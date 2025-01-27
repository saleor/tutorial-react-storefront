export async function POST() {
	console.log("gateway");
	return Response.json({
		data: {
			some: "init-data",
		},
	});
}
