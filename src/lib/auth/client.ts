import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';

const client = new ConvexHttpClient(PUBLIC_CONVEX_URL || '');

export async function signIn(email: string, password: string, name?: string) {
	await client.mutation('auth.signUp', { email, password, name });
}

export async function logIn(email: string, password: string) {
	await client.mutation('auth.signIn', { email, password });
}
