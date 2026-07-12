<script lang="ts">
	import { navigating } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	let navItems = $derived(
		data.user
			? [
					{ label: 'Dashboard', href: '/' },
					{ label: 'Explorar', href: '/surveys' },
					{ label: 'Minhas Enquetes', href: '/my-surveys' },
					{ label: 'Perfil', href: '/profile' }
				]
			: [{ label: 'Entrar', href: '/login' }]
	);
</script>

<svelte:head>
	<title>Dimensões da Vida</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<nav>
	{#each navItems as item (item.href)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={item.href}>{item.label}</a>
	{/each}
</nav>

<main>
	{@render children()}
</main>

{#if navigating.to}
	<div id="loading-indicator">Carregando...</div>
{/if}

<style>
	nav {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #ccc;
		background: #f9f9f9;
	}
	nav a {
		text-decoration: none;
		color: #333;
		font-weight: 500;
	}
	nav a:hover {
		color: #000;
	}
	main {
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}
	#loading-indicator {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		padding: 0.25rem;
		background: #0070f3;
		color: white;
		text-align: center;
		font-size: 0.875rem;
	}
</style>
