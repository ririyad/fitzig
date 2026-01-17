<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { goto } from '$app/navigation';

	const { signIn } = useAuth();

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;
		error = '';

		try {
			await signIn('password', { email, password, flow: 'signIn' });
			await goto('/dashboard');
		} catch (err: any) {
			error = err?.message || 'Failed to sign in';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="card bg-base-200 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Sign In</h2>

		{#if error}
			<div class="alert alert-error" role="alert">{error}</div>
		{/if}

		<form onsubmit={handleLogin} class="flex flex-col gap-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Email</span>
				</label>
				<input
					type="email"
					name="email"
					placeholder="your@email.com"
					class="input input-bordered"
					bind:value={email}
					required
				/>
			</div>

			<div class="form-control">
				<label class="label">
					<span class="label-text">Password</span>
				</label>
				<input
					type="password"
					name="password"
					placeholder="password"
					class="input input-bordered"
					bind:value={password}
					required
				/>
			</div>

			<div class="form-control mt-6">
				<button type="submit" class="btn btn-primary" disabled={isLoading}>
					{#if isLoading}
						<span class="loading loading-spinner"></span>
					{:else}
						Sign In
					{/if}
				</button>
			</div>
		</form>

		<div class="divider">or</div>

		<div class="flex justify-center gap-2">
			<span class="text-sm">Don't have an account?</span>
			<a href="/register" class="link link-primary">Sign up</a>
		</div>
	</div>
</div>
