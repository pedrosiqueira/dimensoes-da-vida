<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<h1>Dimensões da Vida</h1>
<p>Entre com sua conta Google para começar.</p>

<form method="post" action="?/signInSocial" use:enhance>
	<input type="hidden" name="provider" value="google" />
	<input type="hidden" name="callbackURL" value="/" />
	<button>Entrar com Google</button>
</form>
