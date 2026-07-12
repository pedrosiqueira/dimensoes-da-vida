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
		{ border: 'rgb(54, 162, 235)', bg: 'rgba(54, 162, 235, 0.2)' },
		{ border: 'rgb(255, 99, 132)', bg: 'rgba(255, 99, 132, 0.2)' },
		{ border: 'rgb(75, 192, 192)', bg: 'rgba(75, 192, 192, 0.2)' },
		{ border: 'rgb(255, 206, 86)', bg: 'rgba(255, 206, 86, 0.2)' },
		{ border: 'rgb(153, 102, 255)', bg: 'rgba(153, 102, 255, 0.2)' },
		{ border: 'rgb(255, 159, 64)', bg: 'rgba(255, 159, 64, 0.2)' },
		{ border: 'rgb(201, 203, 207)', bg: 'rgba(201, 203, 207, 0.2)' }
	];

	let labels = $derived(data.answers.map((a) => a.questionTitle));
	let myValues = $derived(data.answers.map((a) => a.value));

	let slides = $derived.by(() => {
		const s: { label: string; chartData: ChartData<'radar'> }[] = [];
		const myDataset = {
			label: 'Eu',
			data: myValues,
			borderColor: 'rgb(0, 112, 243)',
			backgroundColor: 'rgba(0, 112, 243, 0.1)',
			borderWidth: 2,
			pointRadius: 4
		};

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
</script>

<h1>Gráfico Radar</h1>
<p>
	<small>Respondido em {new Date(data.response.completedAt!).toLocaleDateString('pt-BR')}</small>
</p>

<RadarChart
	data={slides[currentSlide]?.chartData ?? { labels, datasets: [] }}
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
				<li>{a.questionTitle}: <input disabled value={a.value}></li>
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
