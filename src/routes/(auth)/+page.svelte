<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>Olá, {data.user?.name}!</h1>

{#if data.responses.length > 0}
	<div class="carousel">
		{#each data.responses as response (response.id)}
			<div class="card">
				<h3>{response.surveyTitle}</h3>
				<p>
					{response.completedAt ? new Date(response.completedAt).toLocaleDateString('pt-BR') : ''}
				</p>
				<a href={resolve(`/surveys/${response.surveyId}/result/${response.id}`)}>Abrir</a>
			</div>
		{/each}
	</div>
{:else}
	<p>Você ainda não respondeu nenhuma enquete.</p>
{/if}

<nav class="bottom-nav">
	<a href={resolve('/surveys')}>Explorar Enquetes</a>
	<a href={resolve('/my-surveys')}>Minhas Enquetes</a>
	<a href={resolve('/profile')}>Perfil</a>
</nav>

<style>
	.carousel {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding: 1rem 0;
	}
	.card {
		flex: 0 0 250px;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 8px;
		background: #f9f9f9;
	}
	.bottom-nav {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}
	.bottom-nav a {
		padding: 0.5rem 1rem;
		background: #0070f3;
		color: white;
		text-decoration: none;
		border-radius: 4px;
	}
</style>
