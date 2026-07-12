<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	let navItems = $derived(
		data.user
			? [
					{ label: 'Início', href: '/' },
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

<nav class="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
	<div class="mx-auto flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
		{#each navItems as item (item.href)}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href={item.href}
				class="text-sm font-medium text-text-muted transition-colors hover:text-text sm:text-base"
			>
				{item.label}
			</a>
		{/each}
	</div>
</nav>

<main class="mx-auto max-w-2xl px-4 py-6 sm:px-6">
	{@render children()}
</main>

{#if navigating.to}
	<div
		id="loading-indicator"
		class="fixed inset-x-0 top-0 z-50 bg-accent py-1 text-center text-sm text-white"
	>
		Carregando...
	</div>
{/if}
