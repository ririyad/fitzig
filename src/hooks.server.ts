import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

const isPublicRoute = createRouteMatcher(['/login', '/register', '/']);

const { handleAuth, isAuthenticated } = createConvexAuthHooks();

const requireAuth = async ({ event, resolve }: any) => {
	try {
		if (isPublicRoute(event.url.pathname)) {
			return resolve(event);
		}

		const authenticated = await isAuthenticated(event);

		if (!authenticated) {
			throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
		}

		return resolve(event);
	} catch (e: any) {
		console.error('Auth middleware error:', e);

		if (e?.status === 302) {
			throw e;
		}

		throw redirect(302, '/login');
	}
};

export const handle = sequence(handleAuth, requireAuth);
