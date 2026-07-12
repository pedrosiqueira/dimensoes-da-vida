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

<h1>Explorar Enquetes</h1>

{#if data.surveys.length > 0}
	<ul>
		{#each data.surveys as s (s.id)}
			<li>
				<h3>{s.title}</h3>
				<p>{s.description}</p>
				<a href={resolve(`/surveys/${s.id}`)}>Responder</a>
			</li>
		{/each}
	</ul>

	{#if data.totalPages > 1}
		<div class="pagination">
			<button onclick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
				Anterior
			</button>
			<span>Página {currentPage} de {data.totalPages}</span>
			<button onclick={() => goToPage(currentPage + 1)} disabled={currentPage >= data.totalPages}>
				Próximo
			</button>
		</div>
	{/if}
{:else}
	<p>Nenhuma enquete disponível.</p>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
