import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { getAuthState } = createConvexAuthHandlers();

export async function load({ locals, url }: any) {
	console.log('=== Layout Server Load ===');
	console.log('URL:', url.pathname);
	console.log('Locals:', Object.keys(locals));

	try {
		const authState = await getAuthState(locals);
		console.log('Auth state loaded:', authState);
		console.log('Auth state keys:', authState ? Object.keys(authState) : 'null');
		return { authState };
	} catch (e: any) {
		console.error('Auth state loading error:', e);
		console.error('Error details:', e?.message, e?.code);
		return { authState: null };
	}
}
