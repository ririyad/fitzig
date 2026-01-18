import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

const isPublicRoute = createRouteMatcher(['/login', '/register', '/', '/debug']);

const { handleAuth, isAuthenticated } = createConvexAuthHooks();

const requireAuth = async ({ event, resolve }: any) => {
	console.log('=== Auth Middleware ===');
	console.log('Request path:', event.url.pathname);
	console.log('Method:', event.request.method);

	try {
		if (isPublicRoute(event.url.pathname)) {
			console.log('✓ Public route, skipping auth check');
			return resolve(event);
		}

		console.log('Checking authentication...');
		const authenticated = await isAuthenticated(event);
		console.log('Authenticated:', authenticated);

		if (!authenticated) {
			console.log('✗ Not authenticated, redirecting to login');
			throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
		}

		console.log('✓ Authenticated, proceeding');
		return resolve(event);
	} catch (e: any) {
		console.error('Auth middleware error:', e);
		console.error('Error name:', e?.name);
		console.error('Error message:', e?.message);
		console.error('Error code:', e?.code);
		console.error('Error status:', e?.status);
		console.error('Full error:', JSON.stringify(e, null, 2));

		if (e?.status === 302) {
			console.log('Re-throwing redirect');
			throw e;
		}

		if (e?.name === 'Redirect') {
			console.log('Already a redirect, re-throwing');
			throw e;
		}

		console.log('Non-redirect error, returning error page instead');
		return new Response('Authentication error: ' + (e?.message || 'Unknown error'), { status: 500 });
	}
};

export const handle = sequence(handleAuth, requireAuth);
