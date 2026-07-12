<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1 class="text-2xl font-semibold">Olá, {data.user?.name}!</h1>

{#if data.responses.length > 0}
	<div class="-mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
		{#each data.responses as response (response.id)}
			<div
				class="flex w-60 flex-none snap-start flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:w-64"
			>
				<h3 class="font-medium text-text">{response.surveyTitle}</h3>
				<p class="text-sm text-text-muted">
					{response.completedAt ? new Date(response.completedAt).toLocaleDateString('pt-BR') : ''}
				</p>
				<a
					href={resolve(`/surveys/${response.surveyId}/result/${response.id}`)}
					class="mt-auto text-sm font-medium text-accent hover:text-accent-hover"
				>
					Abrir →
				</a>
			</div>
		{/each}
	</div>
{:else}
	<p class="mt-6 text-text-muted">Você ainda não respondeu nenhuma enquete.</p>
{/if}

<nav class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
	<a
		href={resolve('/surveys')}
		class="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
	>
		Explorar Enquetes
	</a>
	<a
		href={resolve('/my-surveys')}
		class="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
	>
		Minhas Enquetes
	</a>
	<a
		href={resolve('/profile')}
		class="rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
	>
		Perfil
	</a>
</nav>
