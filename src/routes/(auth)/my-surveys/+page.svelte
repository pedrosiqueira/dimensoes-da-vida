<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showDeleteConfirm = $state<number | null>(null);
</script>

<h1>Minhas Enquetes</h1>

{#if data.responses.length > 0}
	<ul>
		{#each data.responses as r (r.id)}
			<li>
				<h3>{r.surveyTitle}</h3>
				<p>
					<small>
						Respondido em {new Date(r.completedAt!).toLocaleDateString('pt-BR')}
					</small>
				</p>
				<a href={resolve(`/surveys/${r.surveyId}/result/${r.id}`)}>Abrir</a>
				<button onclick={() => (showDeleteConfirm = r.id)}>Excluir</button>

				{#if showDeleteConfirm === r.id}
					<div
						class="modal-backdrop"
						role="presentation"
						onclick={() => (showDeleteConfirm = null)}
						onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = null)}
					>
						<div
							class="modal"
							role="dialog"
							tabindex="-1"
							onclick={(e) => e.stopPropagation()}
							onkeydown={() => {}}
						>
							<p>Tem certeza que deseja excluir sua resposta de "{r.surveyTitle}"?</p>
							<form
								method="post"
								action={resolve(`/surveys/${r.surveyId}/result/${r.id}?/deleteResponse`)}
							>
								<button>Confirmar exclusão</button>
							</form>
							<button onclick={() => (showDeleteConfirm = null)}>Cancelar</button>
						</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p>Você ainda não respondeu nenhuma enquete.</p>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.modal {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
