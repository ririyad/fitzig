import { redirect } from '@sveltejs/kit';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { handleAuth } = createConvexAuthHooks();

export async function load({ cookies }: any) {
	const token = cookies.get('convex-auth-token');
	if (!token) {
		redirect(302, '/login');
	}
	redirect(302, '/login');
}
