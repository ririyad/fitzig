import { redirect } from '@sveltejs/kit';

export async function load({ cookies }: any) {
	cookies.delete('convex-auth-token', { path: '/' });
	redirect(302, '/login');
}
