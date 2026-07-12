<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let answers = $state<Record<number, number>>({});
	let showModal = $state(false);
	let teamName = $state('');

	let validationErrors = $derived.by(() => {
		const errors: string[] = [];
		const unanswered = data.questions.some(
			(q) => answers[q.id] === undefined || answers[q.id] === null
		);
		const outOfRange = data.questions.some(
			(q) =>
				answers[q.id] !== undefined &&
				answers[q.id] !== null &&
				(!Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] > 10)
		);
		if (unanswered) errors.push('Todos os campos devem ser preenchidos');
		if (outOfRange) errors.push('Os valores devem estar entre 0 e 10');
		return errors;
	});

	let allValid = $derived(validationErrors.length === 0);

	function handleInput(qId: number, value: string) {
		const num = value === '' ? undefined : Number(value);
		answers[qId] = num as number;
	}
</script>

<h1>{data.survey.title}</h1>
<p>{data.survey.description}</p>

<div class="question">
	<label>
		<strong>Nome da turma</strong> <small>(opcional)</small>
		<input type="text" bind:value={teamName} placeholder="Ex: turma A" />
	</label>
</div>

{#each data.questions as q, i (q.id)}
	<div class="question">
		<label for="q-{q.id}">
			<strong>{i + 1}. {q.title}</strong>
		</label>
		{#if q.description}
			<p>{q.description}</p>
		{/if}
		<div class="slider-row">
			<input
				type="range"
				id="q-{q.id}"
				min="0"
				max="10"
				step="1"
				value={answers[q.id] ?? 5}
				oninput={(e) => handleInput(q.id, (e.target as HTMLInputElement).value)}
			/>
			<input
				type="number"
				min="0"
				max="10"
				value={answers[q.id] ?? ''}
				oninput={(e) => handleInput(q.id, (e.target as HTMLInputElement).value)}
			/>
		</div>
	</div>
{/each}

<button disabled={!allValid} onclick={() => (showModal = true)}>Gerar Gráfico</button>

{#if !allValid}
	<ul class="validation-errors">
		{#each validationErrors as error (error)}
			<li>{error}</li>
		{/each}
	</ul>
{/if}

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
				<input type="hidden" name="teamName" value={teamName} />
				<button>
					Público
					<small>(Vejo os resultados dos outros e vice-versa)</small>
				</button>
			</form>
			<form method="post" action="?/submit" use:enhance>
				<input type="hidden" name="sharingLevel" value="anonymous" />
				<input type="hidden" name="answers" value={JSON.stringify(answers)} />
				<input type="hidden" name="teamName" value={teamName} />
				<button>
					Anônimo
					<small>(Só vejo a média dos resultados, mas ninguém vê meu resultado)</small>
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
	.slider-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	input[type='range'] {
		flex: 1;
		max-width: 300px;
	}
	input[type='number'] {
		width: 60px;
	}
	.validation-errors {
		color: #b00;
		font-size: 0.85rem;
		margin-top: 0.5rem;
		padding-left: 1.2rem;
	}
	.validation-errors li {
		margin-bottom: 0.2rem;
	}
</style>
