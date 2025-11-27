<!-- apps/client/src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { initializeAuth, cleanupAuth, currentUser, isAuthenticated, isLoading } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	import type { Snippet } from 'svelte';
	import '../app.css';

	// Props for Svelte 5 layout
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();

	// Track initialization state to prevent re-initialization
	let hasInitialized = $state(false);
	let initializationError = $state<string | null>(null);

	// Derive auth page status from current route
	const isAuthPage = $derived((): boolean => {
		const routeId = $page.route?.id;
		const authRoutes = [
			'/auth/login',
			'/auth/register', 
			'/auth/forgot-password',
			'/auth/verify',
			'/auth/reset-password'
		];
		const isAuth = authRoutes.includes(routeId || '');
		
		// Debug logging
		console.log('🔍 Route Debug:', {
			currentRoute: routeId,
			isAuthPage: isAuth,
			allAuthRoutes: authRoutes
		});
		
		return isAuth;
	});

	// Determine when to show navbar with detailed logging
	const shouldShowNavbar = $derived((): boolean => {
		const show = !isAuthPage() && hasInitialized && !$isLoading;
		
		// Debug logging - this is crucial for debugging
		console.log('🧭 Navbar Visibility Check:', {
			isAuthPage: isAuthPage(),
			hasInitialized,
			isLoading: $isLoading,
			isAuthenticated: $isAuthenticated,
			currentUser: $currentUser,
			shouldShow: show,
			currentRoute: $page.route?.id
		});
		
		return show;
	});

	// Determine if we should show the loading spinner
	const shouldShowLoading = $derived((): boolean => {
		const loading = browser && (!hasInitialized || $isLoading) && !isAuthPage();
		
		console.log('⏳ Loading State:', {
			browser,
			hasInitialized,
			isLoading: $isLoading,
			isAuthPage: isAuthPage(),
			shouldShowLoading: loading
		});
		
		return loading;
	});

	// Initialize auth system only once per session
	onMount(async (): Promise<void> => {
		// Only initialize in browser and if not already initialized
		if (!browser || hasInitialized) return;

		console.log('🚀 Layout: Starting one-time auth initialization...');

		try {
			// Initialize auth with a reasonable timeout
			const initPromise = initializeAuth();
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error('Initialization timeout')), 5000);
			});

			await Promise.race([initPromise, timeoutPromise]);
			console.log('✅ Layout: Auth initialization completed successfully');
			
			// Log final auth state
			console.log('🔐 Final Auth State:', {
				currentUser: $currentUser,
				isAuthenticated: $isAuthenticated,
				isLoading: $isLoading
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
			console.warn('❌ Layout: Auth initialization failed:', errorMessage);
			initializationError = errorMessage;
		} finally {
			hasInitialized = true;
			console.log('✨ Layout: Auth state marked as initialized');
		}
	});

	// Cleanup resources on destroy
	onDestroy((): void => {
		if (browser) {
			cleanupAuth();
		}
	});

	// Handle rate limit events with proper error boundaries
	const handleRateLimitExceeded = (event: Event): void => {
		const customEvent = event as CustomEvent<{ retryAfter: number }>;
		const { retryAfter } = customEvent.detail;
		console.warn(`⚠️ Rate limit exceeded. Retry after ${retryAfter} seconds.`);
		
		// Show user-friendly notification without disrupting current flow
		window.dispatchEvent(
			new CustomEvent('showNotification', {
				detail: {
					type: 'warning',
					message: `Rate limit reached. Please wait ${retryAfter} seconds before trying again.`,
					duration: retryAfter * 1000
				}
			})
		);
	};

	// Set up rate limit event listener
	onMount((): (() => void) | void => {
		if (!browser) return;

		window.addEventListener('rateLimitExceeded', handleRateLimitExceeded);

		return (): void => {
			window.removeEventListener('rateLimitExceeded', handleRateLimitExceeded);
		};
	});

	// Debug reactive statements to track changes
	$effect(() => {
		console.log('📊 Reactive Update - Auth State Changed:', {
			hasInitialized,
			isLoading: $isLoading,
			isAuthenticated: $isAuthenticated,
			currentUser: $currentUser,
			shouldShowNavbar: shouldShowNavbar()
		});
	});

	$effect(() => {
		console.log('🗺️ Route Changed:', {
			routeId: $page.route?.id,
			url: $page.url?.pathname,
			isAuthPage: isAuthPage()
		});
	});
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#667eea" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<!-- Main layout container with debug info -->
<div class="flex min-h-screen flex-col">
	<!-- Debug info panel (remove in production) -->
	{#if browser}
		<div class="fixed bottom-0 left-0 z-50 max-w-sm bg-black/80 p-2 text-xs text-white opacity-50">
			<div>Route: {$page.route?.id || 'unknown'}</div>
			<div>Auth Page: {isAuthPage() ? 'Yes' : 'No'}</div>
			<div>Initialized: {hasInitialized ? 'Yes' : 'No'}</div>
			<div>Loading: {$isLoading ? 'Yes' : 'No'}</div>
			<div>Show Navbar: {shouldShowNavbar() ? 'Yes' : 'No'}</div>
			<div>Authenticated: {$isAuthenticated ? 'Yes' : 'No'}</div>
		</div>
	{/if}

	<!-- Navbar with explicit visibility indicator -->
	{#if shouldShowNavbar()}
		<div class="border-b-2 border-green-500"> <!-- Temporary green border to see if navbar renders -->
			<Navbar />
		</div>
		<!-- Debug confirmation -->
		<div class="bg-green-100 p-1 text-center text-xs text-green-800">
			🧭 Navbar is rendering (remove this debug message)
		</div>
	{:else}
		<!-- Debug: Show why navbar isn't showing -->
		<div class="bg-red-100 p-1 text-center text-xs text-red-800">
			❌ Navbar hidden: AuthPage={isAuthPage()}, Init={hasInitialized}, Loading={$isLoading}
		</div>
	{/if}

	<!-- Main content area -->
	<main class="flex-1">
		{#if shouldShowLoading()}
			<!-- Loading state for non-auth pages -->
			<div class="flex min-h-[50vh] flex-col items-center justify-center">
				<div class="text-center">
					<div
						class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"
					></div>
					<p class="text-sm text-gray-600 dark:text-gray-300">
						Initializing secure session...
					</p>
					<p class="mt-1 text-xs text-gray-500">
						Debug: hasInit={hasInitialized}, isLoading={$isLoading}
					</p>
				</div>
			</div>
		{:else}
			<!-- Render page content -->
			{@render children?.()}
		{/if}
	</main>

	<!-- Show initialization error if present (non-blocking) -->
	{#if initializationError}
		<div
			class="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 shadow-lg dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200"
			role="alert"
		>
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="font-medium">Authentication Notice</p>
					<p class="mt-1 text-xs opacity-90">
						Some features may be limited. Please refresh if issues persist.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>