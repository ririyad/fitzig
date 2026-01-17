<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { onMount } from 'svelte';

	const { signOut } = useAuth();

	onMount(async () => {
		try {
			await signOut();
		} catch (e) {
			console.error('Logout error:', e);
		}
		window.location.href = '/login';
	});
</script>

<div class="flex items-center justify-center min-h-screen">
	<p>Logging you out...</p>
</div>
