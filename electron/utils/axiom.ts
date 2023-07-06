export default async function axiom(dataset: string, data: any) {
	fetch(`https://api.axiom.co/v1/datasets/${dataset}/ingest`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify([data]),
	});
}
