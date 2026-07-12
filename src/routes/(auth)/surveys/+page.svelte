<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let currentPage = $derived(data.page);

	function goToPage(p: number) {
		const url = new URL(window.location.href);
		url.searchParams.set('page', String(p));
		window.location.href = url.toString();
	}
</script>

<h1 class="text-2xl font-semibold">Explorar Enquetes</h1>

{#if data.surveys.length > 0}
	<ul class="mt-6 space-y-4">
		{#each data.surveys as s (s.id)}
			<li class="rounded-xl border border-border bg-surface p-4">
				<h3 class="font-medium text-text">{s.title}</h3>
				<p class="mt-1 text-sm text-text-muted">{s.description}</p>
				<a
					href={resolve(`/surveys/${s.id}`)}
					class="mt-3 inline-block text-sm font-medium text-accent hover:text-accent-hover"
				>
					Responder →
				</a>
			</li>
		{/each}
	</ul>

	{#if data.totalPages > 1}
		<div class="mt-6 flex items-center justify-center gap-3">
			<button
				onclick={() => goToPage(currentPage - 1)}
				disabled={currentPage <= 1}
				class="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-2 disabled:opacity-40"
			>
				Anterior
			</button>
			<span class="text-sm text-text-muted">Página {currentPage} de {data.totalPages}</span>
			<button
				onclick={() => goToPage(currentPage + 1)}
				disabled={currentPage >= data.totalPages}
				class="rounded-lg border border-border px-3 py-2 text-sm text-text hover:bg-surface-2 disabled:opacity-40"
			>
				Próximo
			</button>
		</div>
	{/if}
{:else}
	<p class="mt-6 text-text-muted">Nenhuma enquete disponível.</p>
{/if}
