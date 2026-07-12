<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingName = $state(false);
	let showDeleteConfirm = $state(false);
	let name = $derived(data.user?.name ?? '');
	let savedName = $state('');
</script>

<h1 class="text-2xl font-semibold">Perfil</h1>

<form
	method="post"
	action="?/updateName"
	class="mt-6 space-y-2"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				editingName = false;
			}
			await update();
		};
	}}
>
	<label class="block">
		<span class="text-sm font-medium text-text-muted">Nome</span>
		<input
			type="text"
			name="name"
			bind:value={name}
			disabled={!editingName}
			minlength="2"
			maxlength="32"
			required
			class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-text disabled:text-text-muted disabled:opacity-70"
		/>
	</label>

	{#if form?.message}
		<p class="text-sm text-danger">{form.message}</p>
	{/if}

	<div class="flex gap-3">
		{#if editingName}
			<button
				class="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
			>
				Salvar
			</button>
			<button
				type="button"
				onclick={() => {
					name = savedName;
					editingName = false;
				}}
				class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
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
				class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
			>
				Alterar
			</button>
		{/if}
	</div>
</form>

<form method="post" action="?/signOut" use:enhance class="mt-8">
	<button
		class="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
	>
		Sair
	</button>
</form>

<button
	onclick={() => (showDeleteConfirm = true)}
	class="mt-4 text-sm font-medium text-danger hover:text-danger-hover"
>
	Excluir conta
</button>

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
			<p class="text-text">Tem certeza que deseja excluir sua conta?</p>
			<form method="post" action="?/deleteAccount" use:enhance>
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
