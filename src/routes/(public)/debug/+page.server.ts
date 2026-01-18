import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { getAuthState } = createConvexAuthHandlers();

export async function load({ locals, url }: any) {
	console.log('=== Debug Page Load ===');
	console.log('URL:', url.pathname);

	try {
		const authState = await getAuthState(locals);
		console.log('Auth state:', authState);
		return {
			authState,
			timestamp: new Date().toISOString(),
			mode: import.meta.env.MODE,
			test: 'debug data'
		};
	} catch (e: any) {
		console.error('Debug load error:', e);
		return {
			error: e.message,
			stack: e.stack,
			timestamp: new Date().toISOString()
		};
	}
}
