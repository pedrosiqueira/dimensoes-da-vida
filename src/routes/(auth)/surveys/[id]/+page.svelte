<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let answers = $state<Record<number, number>>({});
	let showModal = $state(false);

	let allValid = $derived(
		data.questions.length > 0 &&
			data.questions.every(
				(q) =>
					answers[q.id] !== undefined &&
					answers[q.id] !== null &&
					Number.isInteger(answers[q.id]) &&
					answers[q.id] >= 0 &&
					answers[q.id] <= 10
			)
	);

	function handleInput(qId: number, value: string) {
		const num = value === '' ? undefined : Number(value);
		answers[qId] = num as number;
	}
</script>

<h1>{data.survey.title}</h1>
<p>{data.survey.description}</p>

{#each data.questions as q, i (q.id)}
	<div>
		<label for="q-{q.id}">
			<strong>{i + 1}. {q.title}</strong>
		</label>
		{#if q.description}
			<p>{q.description}</p>
		{/if}
		<input
			type="number"
			id="q-{q.id}"
			min="0"
			max="10"
			value={answers[q.id] ?? ''}
			oninput={(e) => handleInput(q.id, (e.target as HTMLInputElement).value)}
		/>
	</div>
{/each}

<button disabled={!allValid} onclick={() => (showModal = true)}>Gerar Gráfico</button>

{#if showModal}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={() => (showModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showModal = false)}
	>
		<div
			class="modal"
			role="dialog"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<h2>Compartilhar resultados</h2>
			<form method="post" action="?/submit" use:enhance>
				<input type="hidden" name="sharingLevel" value="public" />
				<input type="hidden" name="answers" value={JSON.stringify(answers)} />
				<button>
					Público
					<small>Vejo os resultados dos outros e vice-versa</small>
				</button>
			</form>
			<form method="post" action="?/submit" use:enhance>
				<input type="hidden" name="sharingLevel" value="anonymous" />
				<input type="hidden" name="answers" value={JSON.stringify(answers)} />
				<button>
					Anônimo
					<small>Só vejo a média dos resultados, mas ninguém vê meu resultado</small>
				</button>
			</form>
			<button onclick={() => (showModal = false)}>Cancelar</button>
		</div>
	</div>
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
	button small {
		display: block;
		font-weight: normal;
		font-size: 0.8rem;
		margin-top: 0.25rem;
	}
	input[type='number'] {
		width: 80px;
	}
</style>
