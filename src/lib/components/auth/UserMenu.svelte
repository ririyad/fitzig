<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	const { signOut } = useAuth();
	const isAuthenticated = $derived(useAuth().isAuthenticated);
	const auth = useAuth();
	let isMenuOpen = $state(false);

	async function handleLogout() {
		await signOut();
		isMenuOpen = false;
	}
</script>

<div class="dropdown dropdown-end">
	<button type="button" class="btn btn-ghost btn-circle avatar" onclick={() => (isMenuOpen = !isMenuOpen)}>
		<div class="w-10 rounded-full">
			<div class="avatar placeholder">
				<div class="bg-neutral text-neutral-content">
					<span class="text-xs">User</span>
				</div>
			</div>
		</div>
	</button>

	{#if isMenuOpen}
		<ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
			<li>
				<div class="font-bold text-center">User Menu</div>
			</li>
			<li>
				<a href="/settings">Settings</a>
			</li>
			<li>
				<button type="button" onclick={handleLogout} class="w-full text-left">
					Sign Out
				</button>
			</li>
		</ul>
	{/if}
</div>
