// apps/client/src/routes/auth/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { SerializeOptions } from 'cookie';

// Define our own types since $types might not be available
interface LoadEvent {
	cookies: {
		get: (name: string) => string | undefined;
		set: (name: string, value: string, options?: SerializeOptions) => void;
	};
	url: URL;
}

interface ActionEvent extends LoadEvent {
	request: Request;
	fetch: typeof fetch;
}

export const load = async ({ cookies, url }: LoadEvent) => {
	// Check if user is already authenticated via cookies
	const token = cookies.get('auth-token');

	if (token) {
		// If authenticated, redirect away from login
		const redirectTo = url.searchParams.get('redirect') || '/dashboard';
		throw redirect(302, redirectTo);
	}

	return {};
};

export const actions = {
	default: async ({ request, cookies, url, fetch }: ActionEvent) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const rememberMe = formData.get('rememberMe') === 'on';

		// Validation
		const errors: Record<string, string> = {};

		if (!email) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
		}

		if (!password) {
			errors.password = 'Password is required';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				email,
				rememberMe,
				fieldErrors: errors,
				error: 'Please correct the errors below'
			});
		}

		try {
			// Attempt to authenticate with your backend
			const csrfToken = cookies.get('XSRF-TOKEN');

			const response = await fetch('http://localhost:3001/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRF-Token': csrfToken || '' // Include CSRF token
				},
				body: JSON.stringify({
					email,
					password,
					rememberMe
				})
			});

			const result = await response.json();

			if (!response.ok) {
				return fail(400, {
					email,
					rememberMe,
					error: result.message || 'Invalid email or password'
				});
			}

			// Set authentication cookies
			const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day

			if (result.token) {
				cookies.set('auth-token', result.token, {
					path: '/',
					maxAge,
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax'
				});
			}

			// Redirect to intended destination
			const redirectTo = url.searchParams.get('redirect') || '/dashboard';
			throw redirect(302, redirectTo);
		} catch (error) {
			console.error('Login error:', error);
			return fail(500, {
				email,
				rememberMe,
				error: 'An unexpected error occurred. Please try again.'
			});
		}
	}
};
