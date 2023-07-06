export const endpoint = "https://api.postllm.com";

export async function getLicense(uuid: string, license: string) {
	const response = await fetch(`${endpoint}/api/licenses`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-LLM-UUID": uuid,
		},
		body: JSON.stringify({ license }),
	});
	const data = await response.json();
	return data;
}

