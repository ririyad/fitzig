import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { getAuthState } = createConvexAuthHandlers();

export async function load({ locals }: any) {
	try {
		return { authState: await getAuthState(locals) };
	} catch (e) {
		console.error('Auth state loading error:', e);
		return { authState: null };
	}
}
