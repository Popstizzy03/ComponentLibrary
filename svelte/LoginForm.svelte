
<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import type { LoginCredentials } from '$lib/types/auth';
	import GoogleAuthButton from './GoogleAuthButton.svelte';

	// Props with modern syntax
	interface Props {
		redirectTo?: string;
	}
	let { redirectTo = '/dashboard' }: Props = $props();

	// State management with proper typing
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let isLoading = $state(false);
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);
	let fieldErrors = $state<Record<string, string>>({});
	let showPassword = $state(false);
	let formElement = $state<HTMLFormElement>();

	// Enhanced security state
	let attemptCount = 0;
	let isRateLimited = $state(false);
	let rateLimitTimeout: ReturnType<typeof setTimeout>;
	let deviceFingerprint = $state<string>('');
	let lastSubmitTime = 0;

	// Constants for security
	const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
	const MAX_ATTEMPTS = 5;
	const MIN_SUBMIT_INTERVAL = 1000; // 1 second between submissions
	const MAX_EMAIL_LENGTH = 254;
	const MIN_PASSWORD_LENGTH = 8;

	// Toast event dispatcher with better error handling
	const dispatchToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
		try {
			const event = new CustomEvent('toast', {
				detail: { type, message },
				bubbles: true
			});
			window.dispatchEvent(event);
		} catch (err) {
			console.warn('Failed to dispatch toast:', err);
		}
	};

	// Enhanced device fingerprinting with error handling
	const generateDeviceFingerprint = (): string => {
		try {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			let canvasFingerprint = '';

			if (ctx) {
				ctx.textBaseline = 'top';
				ctx.font = '14px Arial';
				ctx.fillText('Device fingerprint', 2, 2);
				canvasFingerprint = canvas.toDataURL();
			}

			const fingerprint = [
				navigator.userAgent || '',
				navigator.language || '',
				`${screen.width}x${screen.height}`,
				new Date().getTimezoneOffset().toString(),
				canvasFingerprint,
				navigator.hardwareConcurrency?.toString() || '',
				navigator.maxTouchPoints?.toString() || ''
			].join('|');

			// Improved hash function
			let hash = 0;
			for (let i = 0; i < fingerprint.length; i++) {
				const char = fingerprint.charCodeAt(i);
				hash = ((hash << 5) - hash + char) & 0x7fffffff; // Keep it positive
			}

			return hash.toString(16);
		} catch (err) {
			console.warn('Failed to generate device fingerprint:', err);
			return Math.random().toString(16).substring(2);
		}
	};

	// Enhanced validation with security considerations
	const validateEmail = (email: string): string | null => {
		if (!email) return 'Email is required';

		const trimmedEmail = email.trim();
		if (trimmedEmail.length > MAX_EMAIL_LENGTH) return 'Email address is too long';

		// More comprehensive email regex
		const emailRegex =
			/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

		if (!emailRegex.test(trimmedEmail)) return 'Please enter a valid email address';

		// Check for suspicious patterns
		if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
			return 'Invalid email format';
		}

		return null;
	};

	const validatePassword = (password: string): string | null => {
		if (!password) return 'Password is required';
		if (password.length < MIN_PASSWORD_LENGTH)
			return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;

		// Check for null bytes or other suspicious characters
		if (password.includes('\0') || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(password)) {
			return 'Password contains invalid characters';
		}

		return null;
	};

	// Enhanced rate limiting with better storage handling
	const checkRateLimit = (): boolean => {
		try {
			const now = Date.now();
			const storageKey = 'login_attempts';
			const storedData = localStorage.getItem(storageKey);

			let attempts: number[] = [];
			if (storedData) {
				try {
					attempts = JSON.parse(storedData);
					if (!Array.isArray(attempts)) attempts = [];
				} catch {
					attempts = [];
				}
			}

			// Filter recent attempts within the rate limit window
			const recentAttempts = attempts.filter(
				(time) => typeof time === 'number' && now - time < RATE_LIMIT_WINDOW
			);

			if (recentAttempts.length >= MAX_ATTEMPTS) {
				isRateLimited = true;
				const oldestAttempt = Math.min(...recentAttempts);
				const waitTime = RATE_LIMIT_WINDOW - (now - oldestAttempt);

				if (rateLimitTimeout) clearTimeout(rateLimitTimeout);
				rateLimitTimeout = setTimeout(() => {
					isRateLimited = false;
				}, waitTime);

				return false;
			}

			// Add current attempt
			const updatedAttempts = [...recentAttempts, now];
			localStorage.setItem(storageKey, JSON.stringify(updatedAttempts));
			return true;
		} catch (err) {
			console.warn('Rate limiting check failed:', err);
			// If localStorage fails, still allow the attempt but log it
			return true;
		}
	};

	// Clear field error with debouncing
	let clearErrorTimeout: ReturnType<typeof setTimeout>;
	const clearFieldError = (field: string) => {
		if (clearErrorTimeout) clearTimeout(clearErrorTimeout);
		clearErrorTimeout = setTimeout(() => {
			if (fieldErrors[field]) {
				fieldErrors = { ...fieldErrors, [field]: '' };
			}
			if (error) {
				error = null;
			}
		}, 100);
	};

	// Enhanced form submission with comprehensive security
	const handleSubmit = async (event: Event) => {
		event.preventDefault();

		// Prevent rapid-fire submissions
		const now = Date.now();
		if (now - lastSubmitTime < MIN_SUBMIT_INTERVAL) {
			return;
		}
		lastSubmitTime = now;

		// Prevent double submission
		if (isSubmitting || isLoading) {
			return;
		}

		// Check rate limiting
		if (!checkRateLimit()) {
			error = `Too many login attempts. Please wait ${Math.ceil(RATE_LIMIT_WINDOW / 60000)} minutes before trying again.`;
			dispatchToast('error', 'Rate limit exceeded. Please wait before trying again.');
			return;
		}

		// Clear previous errors
		error = null;
		fieldErrors = {};

		// Validate inputs
		const emailError = validateEmail(email);
		const passwordError = validatePassword(password);

		if (emailError || passwordError) {
			if (emailError) fieldErrors = { ...fieldErrors, email: emailError };
			if (passwordError) fieldErrors = { ...fieldErrors, password: passwordError };
			return;
		}

		isSubmitting = true;
		isLoading = true;

		try {
			const credentials: LoginCredentials = {
				email: email.trim().toLowerCase(),
				password,
				rememberMe,
				deviceFingerprint
			};

			console.log('LoginForm: Starting login process...');
			await authStore.login(credentials);
			console.log('LoginForm: Login successful');

			// Get redirect URL from query params or use default
			const redirectUrl = $page.url.searchParams.get('redirect') || redirectTo;

			// Clear any stored login attempts on success
			try {
				localStorage.removeItem('login_attempts');
			} catch (err) {
				console.warn('Failed to clear login attempts:', err);
			}

			dispatchToast('success', 'Welcome back! Login successful.');

			// Small delay to show success state before redirect
			setTimeout(() => {
				goto(redirectUrl);
			}, 100);
		} catch (err: any) {
			console.error('LoginForm: Login failed:', err);
			attemptCount++;

			// Handle specific error types with user-friendly messages
			if (err?.field && typeof err.field === 'string') {
				fieldErrors = { ...fieldErrors, [err.field]: err.message || 'Invalid input' };
			} else if (err?.errors && Array.isArray(err.errors)) {
				// Handle validation errors from server
				err.errors.forEach((fieldError: any) => {
					if (fieldError?.field && typeof fieldError.field === 'string') {
						fieldErrors = {
							...fieldErrors,
							[fieldError.field]: fieldError.message || 'Invalid input'
						};
					}
				});
			} else {
				// Handle different error scenarios with better categorization
				let errorMessage = 'Login failed. Please try again.';

				switch (err?.statusCode) {
					case 401:
						errorMessage = 'Invalid email or password. Please check your credentials.';
						break;
					case 403:
						if (err.message?.includes('verify')) {
							errorMessage = 'Please verify your email address before logging in.';
						} else {
							errorMessage = 'Access denied. Please contact support if this persists.';
						}
						break;
					case 429:
						errorMessage = 'Too many login attempts. Please wait before trying again.';
						isRateLimited = true;
						break;
					case 422:
						errorMessage = 'Invalid input. Please check your credentials.';
						break;
					case 500:
						errorMessage = 'Server error. Please try again later.';
						break;
					default:
						if (err?.message?.includes('CSRF')) {
							errorMessage = 'Security token expired. Please refresh the page and try again.';
						} else if (err?.message && typeof err.message === 'string') {
							// Sanitize error message
							errorMessage = err.message.slice(0, 200); // Limit message length
						}
				}

				error = errorMessage;
			}

			// Show appropriate toast message
			const toastMessage =
				err?.statusCode === 401
					? 'Invalid credentials. Please check your email and password.'
					: error || 'Login failed. Please try again.';

			dispatchToast('error', toastMessage);
		} finally {
			isLoading = false;
			isSubmitting = false;
		}
	};

	// Toggle password visibility with security consideration
	const togglePasswordVisibility = () => {
		showPassword = !showPassword;
	};

	// Enhanced keyboard shortcuts
	const handleKeydown = (event: KeyboardEvent) => {
		// Submit on Ctrl+Enter or Cmd+Enter
		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
			event.preventDefault();
			handleSubmit(event);
		}

		// Clear errors on Escape
		if (event.key === 'Escape') {
			error = null;
			fieldErrors = {};
		}
	};

	// Check for existing session with better error handling
	const checkExistingSession = async () => {
		try {
			const user = await authStore.checkSession();
			if (user) {
				// User is already logged in, redirect
				const redirectUrl = $page.url.searchParams.get('redirect') || redirectTo;
				goto(redirectUrl);
			}
		} catch (err) {
			console.log('No existing session found');
		}
	};

	// Input handlers with modern event syntax
	const handleEmailInput = () => clearFieldError('email');
	const handlePasswordInput = () => clearFieldError('password');

	onMount(() => {
		deviceFingerprint = generateDeviceFingerprint();
		checkExistingSession();

		// Focus on email field with error handling
		setTimeout(() => {
			try {
				const emailInput = formElement?.querySelector('#email') as HTMLInputElement;
				emailInput?.focus();
			} catch (err) {
				console.warn('Failed to focus email input:', err);
			}
		}, 100);
	});

	onDestroy(() => {
		if (rateLimitTimeout) {
			clearTimeout(rateLimitTimeout);
		}
		if (clearErrorTimeout) {
			clearTimeout(clearErrorTimeout);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<!-- Header -->
		<div class="text-center">
			<h2 class="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
			<p class="mt-2 text-sm text-gray-600">
				Or
				<a
					href="/auth/register"
					class="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
				>
					create a new account
				</a>
			</p>
		</div>

		<!-- Form -->
		<form bind:this={formElement} onsubmit={handleSubmit} class="mt-8 space-y-6">
			<!-- Error Banner -->
			{#if error}
				<div class="rounded-md border border-red-200 bg-red-50 p-4" role="alert">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-red-800">{error}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Rate Limit Warning -->
			{#if isRateLimited}
				<div class="rounded-md border border-yellow-200 bg-yellow-50 p-4" role="alert">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm font-medium text-yellow-800">
								Account temporarily locked due to multiple failed attempts. Please wait {Math.ceil(
									RATE_LIMIT_WINDOW / 60000
								)} minutes.
							</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="space-y-4">
				<!-- Email Field -->
				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
						Email address
					</label>
					<div class="relative">
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							bind:value={email}
							oninput={handleEmailInput}
							placeholder="Enter your email address"
							class="relative block w-full appearance-none border px-3 py-2 {fieldErrors.email
								? 'border-red-300'
								: 'border-gray-300'} rounded-lg text-gray-900 placeholder-gray-500 transition-colors focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
							class:border-red-300={fieldErrors.email}
							class:focus:ring-red-500={fieldErrors.email}
							class:focus:border-red-500={fieldErrors.email}
							required
							disabled={isLoading || isSubmitting || isRateLimited}
							maxlength={MAX_EMAIL_LENGTH}
						/>
						{#if fieldErrors.email}
							<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
								<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
						{/if}
					</div>
					{#if fieldErrors.email}
						<p class="mt-1 text-sm text-red-600" role="alert">{fieldErrors.email}</p>
					{/if}
				</div>

				<!-- Password Field -->
				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
						Password
					</label>
					<div class="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							bind:value={password}
							oninput={handlePasswordInput}
							placeholder="Enter your password"
							class="relative block w-full appearance-none border px-3 py-2 pr-10 {fieldErrors.password
								? 'border-red-300'
								: 'border-gray-300'} rounded-lg text-gray-900 placeholder-gray-500 transition-colors focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
							class:border-red-300={fieldErrors.password}
							class:focus:ring-red-500={fieldErrors.password}
							class:focus:border-red-500={fieldErrors.password}
							required
							disabled={isLoading || isSubmitting || isRateLimited}
							minlength={MIN_PASSWORD_LENGTH}
						/>
						<!-- Password toggle button -->
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3"
							onclick={togglePasswordVisibility}
							disabled={isLoading || isSubmitting || isRateLimited}
							tabindex="-1"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{#if showPassword}
								<svg
									class="h-5 w-5 text-gray-400 hover:text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
									/>
								</svg>
							{:else}
								<svg
									class="h-5 w-5 text-gray-400 hover:text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
							{/if}
						</button>
					</div>
					{#if fieldErrors.password}
						<p class="mt-1 text-sm text-red-600" role="alert">{fieldErrors.password}</p>
					{/if}
				</div>

				<!-- Google Auth Button with remember me -->
				<div>
					<label class="flex items-center">
						<input type="checkbox" bind:checked={rememberMe} class="mr-2" />
						Remember me for 30 days
					</label>

					<GoogleAuthButton {rememberMe} redirectTo="/dashboard" />
				</div>

				<!-- Remember Me & Forgot Password -->
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						<input
							id="remember-me"
							name="remember-me"
							type="checkbox"
							bind:checked={rememberMe}
							class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
							disabled={isLoading || isSubmitting || isRateLimited}
						/>
						<label for="remember-me" class="ml-2 block text-sm text-gray-700"> Remember me </label>
					</div>

					<div class="text-sm">
						<a
							href="/auth/forgot-password"
							class="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
						>
							Forgot your password?
						</a>
					</div>
				</div>

				<!-- Submit Button -->
				<div>
					<button
						type="submit"
						disabled={isLoading || isSubmitting || isRateLimited || !email || !password}
						class="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{#if isLoading || isSubmitting}
							<svg
								class="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Signing in...
						{:else}
							<svg
								class="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
								/>
							</svg>
							Sign in
						{/if}
					</button>
				</div>

				<!-- Help Text -->
				<div class="text-center text-xs text-gray-500">
					<p>
						By signing in, you agree to our
						<a href="/terms" class="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
						and
						<a href="/privacy" class="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
					</p>
				</div>
			</div>
		</form>

		<!-- Footer Links -->
		<div class="space-y-2 text-center">
			<p class="text-sm text-gray-600">
				Don't have an account?
				<a
					href="/auth/register"
					class="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
				>
					Sign up for free
				</a>
			</p>
		</div>
	</div>
</div>
