<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingName = $state(false);
	let showDeleteConfirm = $state(false);
	let name = $derived(data.user?.name ?? '');
	let savedName = $state('');
</script>

<h1>Perfil</h1>

<form
	method="post"
	action="?/updateName"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				editingName = false;
			}
			await update();
		};
	}}
>
	<label>
		Nome
		<input
			type="text"
			name="name"
			bind:value={name}
			disabled={!editingName}
			minlength="2"
			maxlength="32"
			required
		/>
	</label>

	{#if editingName}
		<button>Salvar</button>
		<button
			type="button"
			onclick={() => {
				name = savedName;
				editingName = false;
			}}
		>
			Cancelar
		</button>
	{:else}
		<button
			type="button"
			onclick={() => {
				savedName = name;
				editingName = true;
			}}
		>
			Alterar
		</button>
	{/if}
</form>

{#if form?.message}
	<p class="error">{form.message}</p>
{/if}

<form method="post" action="?/signOut" use:enhance>
	<button>Sair</button>
</form>

<button onclick={() => (showDeleteConfirm = true)}>Excluir conta</button>

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
			<p>Tem certeza que deseja excluir sua conta?</p>
			<form method="post" action="?/deleteAccount" use:enhance>
				<button>Confirmar exclusão</button>
			</form>
			<button onclick={() => (showDeleteConfirm = false)}>Cancelar</button>
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
</style>
