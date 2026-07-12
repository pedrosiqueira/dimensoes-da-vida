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

<h1 class="text-2xl font-semibold">{data.survey.title}</h1>
<p class="mt-1 text-text-muted">{data.survey.description}</p>

<div class="mt-6 space-y-6">
	<div>
		<label class="block">
			<span class="text-sm font-medium text-text-muted">
				Nome da turma <span class="text-xs">(opcional)</span>
			</span>
			<input
				type="text"
				bind:value={teamName}
				placeholder="Ex: turma A"
				class="mt-1 w-full max-w-xs rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text"
			/>
		</label>
	</div>

	{#each data.questions as q, i (q.id)}
		<div class="rounded-xl border border-border bg-surface p-4">
			<label for="q-{q.id}" class="block font-medium text-text">
				{i + 1}. {q.title}
			</label>
			{#if q.description}
				<p class="mt-1 text-sm text-text-muted">{q.description}</p>
			{/if}
			<div class="mt-3 flex items-center gap-3">
				<input
					type="range"
					id="q-{q.id}"
					min="0"
					max="10"
					step="1"
					value={answers[q.id] ?? 5}
					oninput={(e) => handleInput(q.id, (e.target as HTMLInputElement).value)}
					onpointerdown={() => {
						(document.activeElement as HTMLElement)?.blur();
					}}
					class="h-2 flex-1 accent-accent"
				/>
				<input
					type="number"
					inputmode="numeric"
					min="0"
					max="10"
					value={answers[q.id] ?? ''}
					oninput={(e) => handleInput(q.id, (e.target as HTMLInputElement).value)}
					class="w-16 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-center text-text"
				/>
			</div>
		</div>
	{/each}
</div>

<button
	disabled={!allValid}
	onclick={() => (showModal = true)}
	class="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40 sm:w-auto"
>
	Gerar Gráfico
</button>

{#if !allValid}
	<ul class="mt-3 list-inside list-disc space-y-1 text-sm text-danger">
		{#each validationErrors as error (error)}
			<li>{error}</li>
		{/each}
	</ul>
{/if}

{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="presentation"
		onclick={() => (showModal = false)}
		onkeydown={(e) => e.key === 'Escape' && (showModal = false)}
	>
		<div
			class="w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface-2 p-6"
			role="dialog"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<h2 class="text-lg font-medium text-text">Compartilhar resultados</h2>
			<form method="post" action="?/submit" use:enhance>
				<input type="hidden" name="sharingLevel" value="public" />
				<input type="hidden" name="answers" value={JSON.stringify(answers)} />
				<input type="hidden" name="teamName" value={teamName} />
				<button
					class="w-full rounded-lg bg-accent px-4 py-2.5 text-left text-sm font-medium text-white hover:bg-accent-hover"
				>
					Público
					<span class="mt-0.5 block text-xs font-normal text-white/80">
						(Vejo os resultados dos outros e vice-versa)
					</span>
				</button>
			</form>
			<form method="post" action="?/submit" use:enhance>
				<input type="hidden" name="sharingLevel" value="anonymous" />
				<input type="hidden" name="answers" value={JSON.stringify(answers)} />
				<input type="hidden" name="teamName" value={teamName} />
				<button
					class="w-full rounded-lg border border-border px-4 py-2.5 text-left text-sm font-medium text-text hover:bg-surface"
				>
					Anônimo
					<span class="mt-0.5 block text-xs font-normal text-text-muted">
						(Só vejo a média dos resultados, mas ninguém vê meu resultado)
					</span>
				</button>
			</form>
			<button
				onclick={() => (showModal = false)}
				class="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface"
			>
				Cancelar
			</button>
		</div>
	</div>
{/if}
