<script lang="ts">
	import { enhance } from '$app/forms';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import type { PageData } from './$types';
	import type { ChartData, ChartOptions } from 'chart.js';

	let { data }: { data: PageData } = $props();

	let showCompare = $state(false);
	let teamName = $derived(data.response?.teamName ?? '');
	let showDeleteConfirm = $state(false);
	let showSurveyDetail = $state(false);
	let currentSlide = $state(0);
	let savingTeam = $state(false);
	let justSavedTeam = $state(false);
	let saveTimeout: ReturnType<typeof setTimeout>;

	const CHART_OPTIONS: ChartOptions<'radar'> = {
		scales: {
			r: {
				min: 0,
				max: 10,
				ticks: {
					stepSize: 1,
					color: 'rgba(255, 255, 255, 0.85)',
					backdropColor: 'transparent'
				},
				grid: { color: 'rgba(255, 255, 255, 0.15)' },
				angleLines: { color: 'rgba(255, 255, 255, 0.15)' },
				pointLabels: { color: 'rgba(255, 255, 255, 0.9)' }
			}
		},
		plugins: {
			legend: {
				position: 'bottom',
				labels: { color: 'rgba(255, 255, 255, 0.9)' }
			},
			tooltip: { enabled: true }
		}
	};

	const COLORS = [
		{ border: 'rgb(0, 114, 178)', bg: 'rgba(0, 114, 178, 0.2)' }, // Azul
		{ border: 'rgb(213, 94, 0)', bg: 'rgba(213, 94, 0, 0.2)' }, // Vermelho-alaranjado
		{ border: 'rgb(0, 158, 115)', bg: 'rgba(0, 158, 115, 0.2)' }, // Verde-azulado
		{ border: 'rgb(230, 159, 0)', bg: 'rgba(230, 159, 0, 0.2)' }, // Laranja
		{ border: 'rgb(204, 121, 167)', bg: 'rgba(204, 121, 167, 0.2)' }, // Roxo-avermelhado
		{ border: 'rgb(86, 180, 233)', bg: 'rgba(86, 180, 233, 0.2)' }, // Azul-céu
		{ border: 'rgb(240, 228, 66)', bg: 'rgba(240, 228, 66, 0.2)' } // Amarelo
	];

	let labels = $derived(data.answers.map((a) => a.questionTitle));
	let myValues = $derived(data.answers.map((a) => a.value));

	let myDataset = $derived({
		label: 'Eu',
		data: myValues,
		borderColor: 'rgb(255, 255, 255)',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderWidth: 2,
		pointRadius: 4
	});

	let baseChartData = $derived<ChartData<'radar'>>({
		labels,
		datasets: [myDataset]
	});

	let slides = $derived.by(() => {
		const s: { label: string; chartData: ChartData<'radar'> }[] = [];

		if (data.comparison?.allAverage) {
			s.push({
				label: 'Média Geral',
				chartData: {
					labels,
					datasets: [
						myDataset,
						{
							label: 'Média de Todos',
							data: data.comparison.allAverage.map((a) => a.value),
							borderColor: COLORS[0].border,
							backgroundColor: COLORS[0].bg,
							borderWidth: 2,
							pointRadius: 3
						}
					]
				}
			});
		}

		if (data.comparison?.teamAverage) {
			s.push({
				label: 'Média da Turma',
				chartData: {
					labels,
					datasets: [
						myDataset,
						{
							label: 'Média da Turma',
							data: data.comparison.teamAverage.map((a) => a.value),
							borderColor: COLORS[1].border,
							backgroundColor: COLORS[1].bg,
							borderWidth: 2,
							pointRadius: 3
						}
					]
				}
			});
		}

		if (data.comparison?.teamMembers) {
			for (let i = 0; i < data.comparison.teamMembers.length; i++) {
				const member = data.comparison.teamMembers[i];
				const color = COLORS[(i + 2) % COLORS.length];
				s.push({
					label: member.userName,
					chartData: {
						labels,
						datasets: [
							myDataset,
							{
								label: member.userName,
								data: member.answers.map((a) => a.value),
								borderColor: color.border,
								backgroundColor: color.bg,
								borderWidth: 2,
								pointRadius: 3
							}
						]
					}
				});
			}
		}

		return s;
	});

	let displayedChartData = $derived(
		showCompare ? (slides[currentSlide]?.chartData ?? baseChartData) : baseChartData
	);
</script>

<h1 class="text-2xl font-semibold">Gráfico Radar</h1>
<p class="mt-1 text-sm text-text-muted">
	Respondido em {new Date(data.response.completedAt!).toLocaleDateString('pt-BR')}
</p>

<div class="mt-6">
	<RadarChart data={displayedChartData} options={CHART_OPTIONS} />
</div>

{#if showCompare && slides.length > 0}
	<div class="mt-4 flex items-center justify-center gap-3 text-sm">
		<button
			onclick={() => (currentSlide = Math.max(0, currentSlide - 1))}
			disabled={currentSlide === 0}
			class="rounded-lg border border-border px-3 py-2 text-text hover:bg-surface-2 disabled:opacity-40"
		>
			Anterior
		</button>
		<span class="text-text-muted">
			{slides[currentSlide]?.label ?? ''} ({currentSlide + 1}/{slides.length})
		</span>
		<button
			onclick={() => (currentSlide = Math.min(slides.length - 1, currentSlide + 1))}
			disabled={currentSlide === slides.length - 1}
			class="rounded-lg border border-border px-3 py-2 text-text hover:bg-surface-2 disabled:opacity-40"
		>
			Próximo
		</button>
	</div>
{/if}

<form
	method="post"
	action="?/setTeam"
	use:enhance={() => {
		savingTeam = true;
		justSavedTeam = false;
		return async ({ result, update }) => {
			savingTeam = false;
			if (result.type === 'success') {
				justSavedTeam = true;
				clearTimeout(saveTimeout);
				saveTimeout = setTimeout(() => (justSavedTeam = false), 2500);
			}
			await update();
		};
	}}
	class="mt-8"
>
	<label class="block max-w-xs">
		<span class="text-sm font-medium text-text-muted">Minha Turma</span>
		<input
			type="text"
			name="teamName"
			bind:value={teamName}
			class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text"
		/>
	</label>

	<div class="mt-3 flex items-center gap-3">
		<button
			disabled={savingTeam}
			class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2 disabled:opacity-60"
		>
			{savingTeam ? 'Salvando...' : 'Salvar'}
		</button>

		{#if justSavedTeam}
			<span class="flex items-center gap-1 text-sm text-success">
				<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
					<path
						d="M4 10.5L8 14.5L16 6"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Salvo
			</span>
		{/if}
	</div>
</form>

<div class="mt-6 flex flex-wrap gap-3">
	<button
		disabled={slides.length === 0}
		onclick={() => {
			showCompare = !showCompare;
			currentSlide = 0;
		}}
		class="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-40"
	>
		{showCompare ? 'Remover comparação' : 'Comparar com outros'}
	</button>

	<button
		onclick={() => (showSurveyDetail = !showSurveyDetail)}
		class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
	>
		{showSurveyDetail ? 'Fechar enquete' : 'Ver enquete'}
	</button>

	<button
		onclick={() => window.print()}
		class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
	>
		Imprimir enquete
	</button>

	<button
		onclick={() => (showDeleteConfirm = true)}
		class="rounded-lg px-4 py-2.5 text-sm font-medium text-danger hover:bg-surface-2"
	>
		Excluir enquete
	</button>
</div>

{#if showSurveyDetail}
	<div class="mt-6 rounded-xl border border-border bg-surface p-4">
		<h2 class="text-lg font-medium text-text">{data.survey.title}</h2>
		<p class="mt-1 text-sm text-text-muted">{data.survey.description}</p>
		<ol class="mt-4 space-y-4">
			{#each data.answers as a (a.id)}
				<li class="flex items-start justify-between gap-3">
					<div>
						<p class="text-sm font-medium text-text">{a.questionTitle}</p>
						{#if a.questionDescription}
							<p class="mt-0.5 text-sm text-text-muted">{a.questionDescription}</p>
						{/if}
					</div>
					<input
						disabled
						value={a.value}
						class="w-16 shrink-0 rounded-lg border border-border bg-surface-2 px-2 py-1 text-center text-text-muted"
					/>
				</li>
			{/each}
		</ol>
	</div>
{/if}

{#if showDeleteConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
		role="presentation"
		onclick={() => (showDeleteConfirm = false)}
		onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = false)}
	>
		<div
			class="w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface-2 p-6"
			role="dialog"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<p class="text-text">Tem certeza que deseja excluir sua resposta?</p>
			<form method="post" action="?/deleteResponse" use:enhance>
				<button
					class="w-full rounded-lg bg-danger px-4 py-2.5 text-sm font-medium text-white hover:bg-danger-hover"
				>
					Confirmar exclusão
				</button>
			</form>
			<button
				onclick={() => (showDeleteConfirm = false)}
				class="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface"
			>
				Cancelar
			</button>
		</div>
	</div>
{/if}
