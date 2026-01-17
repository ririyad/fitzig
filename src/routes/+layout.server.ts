import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { getAuthState } = createConvexAuthHandlers();

export async function load({ locals }: any) {
	return { authState: await getAuthState(locals) };
}
