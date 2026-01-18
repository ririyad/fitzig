export async function load({ cookies }: any) {
	console.log('=== Debug Page Load ===');

	const authCookie = cookies.get('convex-auth-token');

	return {
		isAuthenticated: !!authCookie,
		timestamp: new Date().toISOString(),
		mode: import.meta.env.MODE
	};
}
