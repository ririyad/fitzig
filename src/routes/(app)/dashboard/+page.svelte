<script lang="ts">
	import UserMenu from '$lib/components/auth/UserMenu.svelte';
</script>

<div class="min-h-screen bg-base-200">
	<div class="navbar bg-base-100 shadow-lg">
		<div class="navbar-start">
			<a href="/" class="btn btn-ghost text-xl">
				FitZig
			</a>
		</div>
		<div class="navbar-end">
			<UserMenu />
		</div>
	</div>

	<div class="container mx-auto p-4">
		<h1 class="text-3xl font-bold mb-4">Dashboard</h1>
		<p class="mb-8">Welcome to your fitness dashboard</p>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Create Session</h2>
					<p class="text-sm opacity-70">Start a new workout session</p>
					<div class="card-actions justify-end">
						<a href="/sessions/new" class="btn btn-primary">Create</a>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">Exercises</h2>
					<p class="text-sm opacity-70">Browse the exercise library</p>
					<div class="card-actions justify-end">
						<a href="/exercises" class="btn btn-secondary">Browse</a>
					</div>
				</div>
			</div>

			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h2 class="card-title">History</h2>
					<p class="text-sm opacity-70">View your workout history</p>
					<div class="card-actions justify-end">
						<a href="/history" class="btn btn-accent">View</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
