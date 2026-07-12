<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<div class="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
	<h1 class="text-2xl font-semibold text-text">Dimensões da Vida</h1>
	<p class="text-text-muted">Entre com sua conta Google para começar.</p>

	<form method="post" action="?/signInSocial" use:enhance>
		<input type="hidden" name="provider" value="google" />
		<input type="hidden" name="callbackURL" value="/" />
		<button
			class="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
		>
			Entrar com Google
		</button>
	</form>
</div>
