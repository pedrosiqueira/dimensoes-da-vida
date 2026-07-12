import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	signInSocial: async (event) => {
		const formData = await event.request.formData();
		const provider = formData.get('provider')?.toString() ?? 'google';
		const callbackURL = formData.get('callbackURL')?.toString() ?? '/';

		try {
			const result = await auth.api.signInSocial({
				body: {
					provider: provider as 'google',
					callbackURL
				}
			});

			if (result.url) {
				return redirect(302, result.url);
			}
		} catch (error) {
			if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
				return redirect(error.status as number, error.location as string);
			}
			return fail(500, { message: 'Erro ao conectar com Google' });
		}

		return fail(400, { message: 'Falha na autenticação' });
	}
};
