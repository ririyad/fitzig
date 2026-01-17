import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

const isPublicRoute = createRouteMatcher(['/login', '/register']);

const { handleAuth, isAuthenticated } = createConvexAuthHooks();

const requireAuth = async ({ event, resolve }: any) => {
	if (isPublicRoute(event.url.pathname)) {
		return resolve(event);
	}

	if (!(await isAuthenticated(event))) {
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
	}

	return resolve(event);
};

export const handle = sequence(handleAuth, requireAuth);
