<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useQuery } from 'convex-svelte';

	const { signOut } = useAuth();
	const isAuthenticated = $derived(useAuth().isAuthenticated);
	let user = useQuery(
		(async () => {
			const convex = (await import('../../convex/_generated/api')).api;
			const client = (await import('convex-svelte')).useConvexClient();
			return await client.query(convex.users.getCurrentUser, {});
		})()
	);

	let isMenuOpen = $state(false);

	async function handleLogout() {
		await signOut();
		isMenuOpen = false;
	}
</script>

<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar" onclick={() => (isMenuOpen = !isMenuOpen)}>
		{#if user.data?.image}
			<div class="w-10 rounded-full">
				<img alt="User avatar" src={user.data.image} />
			</div>
		{:else}
			<div class="avatar placeholder">
				<div class="bg-neutral text-neutral-content">
					<span class="text-xs">{user.data?.name?.charAt(0) || '?'}</span>
				</div>
			</div>
		{/if}
	</div>

	{#if isMenuOpen}
		<ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
			<li>
				<div class="font-bold text-center">{user.data?.name || 'User'}</div>
			</li>
			<li>
				<a href="/settings" class="justify-between">
					Settings
				</a>
			</li>
			<li>
				<button onclick={handleLogout} class="w-full text-left">
					Sign Out
				</button>
			</li>
		</ul>
	{/if}
</div>
