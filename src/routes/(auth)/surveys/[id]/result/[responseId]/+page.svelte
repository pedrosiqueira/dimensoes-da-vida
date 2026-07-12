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

	const CHART_OPTIONS: ChartOptions<'radar'> = {
		scales: {
			r: {
				min: 0,
				max: 10,
				ticks: { stepSize: 1 }
			}
		},
		plugins: {
			legend: { position: 'bottom' },
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

	let myChartData = $derived({
		labels,
		datasets: [
			{
				label: 'Eu',
				data: myValues,
				borderColor: 'rgb(0, 0, 0)',
				backgroundColor: 'rgba(0, 0, 0, 0.1)',
				borderWidth: 2,
				pointRadius: 4
			}
		]
	});

	let slides = $derived.by(() => {
		const s: { label: string; chartData: ChartData<'radar'> }[] = [];

		if (data.comparison?.allAverage) {
			s.push({
				label: 'Média Geral',
				chartData: {
					labels,
					datasets: [
						myChartData.datasets[0],
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
						myChartData.datasets[0],
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
							myChartData.datasets[0],
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
</script>

<h1>Gráfico Radar</h1>
<p>
	<small>Respondido em {new Date(data.response.completedAt!).toLocaleDateString('pt-BR')}</small>
</p>

<RadarChart
	data={showCompare ? (slides[currentSlide]?.chartData ?? myChartData) : myChartData}
	options={CHART_OPTIONS}
/>

{#if showCompare && slides.length > 0}
	<div class="carousel-controls">
		<button
			onclick={() => (currentSlide = Math.max(0, currentSlide - 1))}
			disabled={currentSlide === 0}
		>
			Anterior
		</button>
		<span>{slides[currentSlide]?.label ?? ''} ({currentSlide + 1}/{slides.length})</span>
		<button
			onclick={() => (currentSlide = Math.min(slides.length - 1, currentSlide + 1))}
			disabled={currentSlide === slides.length - 1}
		>
			Próximo
		</button>
	</div>
{/if}

<form method="post" action="?/setTeam" use:enhance>
	<label>
		Minha Turma
		<input type="text" name="teamName" bind:value={teamName} />
	</label>
	<button>Salvar</button>
</form>

<button
	disabled={slides.length === 0}
	onclick={() => {
		showCompare = !showCompare;
		currentSlide = 0;
	}}
>
	{showCompare ? 'Remover comparação' : 'Comparar com outros'}
</button>

<button onclick={() => (showSurveyDetail = !showSurveyDetail)}>
	{showSurveyDetail ? 'Fechar enquete' : 'Ver enquete'}
</button>

<button onclick={() => window.print()}>Imprimir enquete</button>

<button onclick={() => (showDeleteConfirm = true)}>Excluir enquete</button>

{#if showDeleteConfirm}
	<div
		class="modal-backdrop"
		role="presentation"
		onclick={() => (showDeleteConfirm = false)}
		onkeydown={(e) => e.key === 'Escape' && (showDeleteConfirm = false)}
	>
		<div
			class="modal"
			role="dialog"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<p>Tem certeza que deseja excluir sua resposta?</p>
			<form method="post" action="?/deleteResponse" use:enhance>
				<button>Confirmar exclusão</button>
			</form>
			<button onclick={() => (showDeleteConfirm = false)}>Cancelar</button>
		</div>
	</div>
{/if}

{#if showSurveyDetail}
	<div>
		<h2>{data.survey.title}</h2>
		<p>{data.survey.description}</p>
		<ol>
			{#each data.answers as a (a.id)}
				<li>
					<strong>{a.questionTitle}</strong>: <input disabled value={a.value} />
					{#if a.questionDescription}
						<p>{a.questionDescription}</p>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
{/if}

<style>
	.carousel-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin: 1rem 0;
	}
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
