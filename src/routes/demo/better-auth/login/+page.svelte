<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<h1>Login</h1>

<form method="post" action="?/signInSocial" use:enhance>
	<input type="hidden" name="provider" value="google" />
	<input type="hidden" name="callbackURL" value="/demo/better-auth" />
	<button>Sign in with Google</button>
</form>
