export async function load({ cookies }: any) {
	console.log('=== Layout Server Load ===');

	const authCookie = cookies.get('convex-auth-token');
	const isAuthenticated = !!authCookie;

	console.log('Auth cookie present:', isAuthenticated);

	return {
		isAuthenticated
	};
}
