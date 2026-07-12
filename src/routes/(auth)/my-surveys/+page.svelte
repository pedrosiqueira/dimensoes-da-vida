<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showDeleteConfirm = $state<number | null>(null);
</script>

<h1 class="text-2xl font-semibold">Minhas Enquetes</h1>

{#if data.responses.length > 0}
	<ul class="mt-6 space-y-4">
		{#each data.responses as r (r.id)}
			<li class="rounded-xl border border-border bg-surface p-4">
				<h3 class="font-medium text-text">{r.surveyTitle}</h3>
				<p class="mt-1 text-sm text-text-muted">
					Respondido em {new Date(r.completedAt!).toLocaleDateString('pt-BR')}
				</p>
				<div class="mt-3 flex items-center gap-4">
					<a
						href={resolve(`/surveys/${r.surveyId}/result/${r.id}`)}
						class="text-sm font-medium text-accent hover:text-accent-hover"
					>
						Abrir →
					</a>
					<button
						onclick={() => (showDeleteConfirm = r.id)}
						class="text-sm font-medium text-danger hover:text-danger-hover"
					>
						Excluir
					</button>
				</div>

				{#if showDeleteConfirm === r.id}
					<div
						class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
						role="presentation"
						onclick={() => (showDeleteConfirm = null)}
						onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = null)}
					>
						<div
							class="w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface-2 p-6"
							role="dialog"
							tabindex="-1"
							onclick={(e) => e.stopPropagation()}
							onkeydown={() => {}}
						>
							<p class="text-text">
								Tem certeza que deseja excluir sua resposta de "{r.surveyTitle}"?
							</p>
							<form
								method="post"
								action={resolve(`/surveys/${r.surveyId}/result/${r.id}?/deleteResponse`)}
							>
								<button
									class="w-full rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white hover:bg-danger-hover"
								>
									Confirmar exclusão
								</button>
							</form>
							<button
								onclick={() => (showDeleteConfirm = null)}
								class="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface"
							>
								Cancelar
							</button>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p class="mt-6 text-text-muted">Você ainda não respondeu nenhuma enquete.</p>
{/if}
