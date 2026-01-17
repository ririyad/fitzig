<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { goto } from '$app/navigation';

	const { signIn } = useAuth();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleRegister(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;
		error = '';

		try {
			await signIn('password', { email, password, name, flow: 'signUp' });
			await goto('/dashboard');
		} catch (err: any) {
			error = err?.message || 'Failed to create account';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="card bg-base-200 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Create Account</h2>

		{#if error}
			<div class="alert alert-error" role="alert">{error}</div>
		{/if}

		<form onsubmit={handleRegister} class="flex flex-col gap-4">
			<div class="form-control">
				<label for="name" class="label">
					<span class="label-text">Name</span>
				</label>
				<input
					id="name"
					type="text"
					name="name"
					placeholder="Your name"
					class="input input-bordered"
					bind:value={name}
					required
				/>
			</div>

			<div class="form-control">
				<label for="email" class="label">
					<span class="label-text">Email</span>
				</label>
				<input
					id="email"
					type="email"
					name="email"
					placeholder="your@email.com"
					class="input input-bordered"
					bind:value={email}
					required
				/>
			</div>

			<div class="form-control">
				<label for="password" class="label">
					<span class="label-text">Password</span>
				</label>
				<input
					id="password"
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
						Create Account
					{/if}
				</button>
			</div>
		</form>

		<div class="divider">or</div>

		<div class="flex justify-center gap-2">
			<span class="text-sm">Already have an account?</span>
			<a href="/login" class="link link-primary">Sign in</a>
		</div>
	</div>
</div>
