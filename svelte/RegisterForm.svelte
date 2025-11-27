<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Separator } from "$lib/components/ui/separator";
  
  // Form state
  let firstName = '';
  let lastName = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let termsAccepted = false;
  let privacyAccepted = false;
  let marketingOptIn = false;
  
  // Validation state
  let fieldErrors = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  let error = '';
  let isLoading = false;
  
  // Password validation
  $: passwordValid = password && 
                    password.length >= 8 && 
                    /[a-z]/.test(password) && 
                    /[A-Z]/.test(password) && 
                    /[0-9]/.test(password) && 
                    /[^A-Za-z0-9]/.test(password);
  
  // Check if passwords match
  $: passwordMatch = password === confirmPassword && password !== '';
  
  function clearFieldError(field) {
    fieldErrors = { ...fieldErrors, [field]: '' };
  }
  
  async function handleSubmit() {
    isLoading = true;
    try {
      // Form submission logic
      // Redirect to onboarding page on success
      window.location.href = '/onboarding';
    } catch (err) {
      error = err.message || 'Failed to create account';
    } finally {
      isLoading = false;
    }
  }
  
  async function handleGoogleSignIn() {
    isLoading = true;
    try {
      // Google authentication logic
      // Redirect to onboarding page on success
      window.location.href = '/onboarding';
    } catch (err) {
      error = err.message || 'Failed to authenticate with Google';
    } finally {
      isLoading = false;
    }
  }
</script>

<Card class="w-full max-w-md mx-auto shadow-md">
  <CardHeader class="space-y-1">
    <CardTitle class="text-2xl font-bold text-center">Create Account</CardTitle>
  </CardHeader>
  
  <CardContent>
    {#if error}
      <Alert variant="destructive" class="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    {/if}
    
    <div class="space-y-4">
      <Button 
        type="button" 
        variant="outline" 
        class="w-full flex items-center justify-center gap-2"
        on:click={handleGoogleSignIn}
        disabled={isLoading}
      >
        {#if isLoading}
          <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        {:else}
          <svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        {/if}
      </Button>
      
      <div class="relative">
        <Separator />
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
          or
        </span>
      </div>
    
      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <Label for="firstName">First Name</Label>
            <Input 
              id="firstName"
              type="text"
              bind:value={firstName}
              on:focus={() => clearFieldError('firstName')}
              placeholder="Enter your first name"
              class:border-red-500={fieldErrors.firstName}
              disabled={isLoading}
            />
            {#if fieldErrors.firstName}
              <p class="text-xs text-red-500">{fieldErrors.firstName}</p>
            {/if}
          </div>
          
          <div class="space-y-1">
            <Label for="lastName">Last Name</Label>
            <Input 
              id="lastName"
              type="text"
              bind:value={lastName}
              on:focus={() => clearFieldError('lastName')}
              placeholder="Enter your last name"
              class:border-red-500={fieldErrors.lastName}
              disabled={isLoading}
            />
            {#if fieldErrors.lastName}
              <p class="text-xs text-red-500">{fieldErrors.lastName}</p>
            {/if}
          </div>
        </div>
        
        <div class="space-y-1">
          <Label for="email">Email Address *</Label>
          <Input 
            id="email"
            type="email"
            bind:value={email}
            on:focus={() => clearFieldError('email')}
            placeholder="Enter your email"
            class:border-red-500={fieldErrors.email}
            required
            disabled={isLoading}
          />
          {#if fieldErrors.email}
            <p class="text-xs text-red-500">{fieldErrors.email}</p>
          {/if}
        </div>
        
        <div class="space-y-1">
          <Label for="password">Password *</Label>
          <Input 
            id="password"
            type="password"
            bind:value={password}
            on:focus={() => clearFieldError('password')}
            placeholder="Create a password"
            class:border-red-500={fieldErrors.password}
            class:border-green-500={password && passwordValid}
            required
            disabled={isLoading}
          />
          {#if fieldErrors.password}
            <p class="text-xs text-red-500">{fieldErrors.password}</p>
          {:else if password}
            <div class="text-xs grid grid-cols-2 gap-1 mt-1">
              <p class:text-green-500={password.length >= 8} class:text-gray-400={password.length < 8}>✓ At least 8 characters</p>
              <p class:text-green-500={/[a-z]/.test(password)} class:text-gray-400={!/[a-z]/.test(password)}>✓ One lowercase letter</p>
              <p class:text-green-500={/[A-Z]/.test(password)} class:text-gray-400={!/[A-Z]/.test(password)}>✓ One uppercase letter</p>
              <p class:text-green-500={/[0-9]/.test(password)} class:text-gray-400={!/[0-9]/.test(password)}>✓ One number</p>
              <p class:text-green-500={/[^A-Za-z0-9]/.test(password)} class:text-gray-400={!/[^A-Za-z0-9]/.test(password)}>✓ One special character</p>
            </div>
          {/if}
        </div>
        
        <div class="space-y-1">
          <Label for="confirmPassword">Confirm Password *</Label>
          <Input 
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            on:focus={() => clearFieldError('confirmPassword')}
            placeholder="Confirm your password"
            class:border-red-500={fieldErrors.confirmPassword || (confirmPassword && !passwordMatch)}
            class:border-green-500={confirmPassword && passwordMatch}
            required
            disabled={isLoading}
          />
          {#if fieldErrors.confirmPassword}
            <p class="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
          {:else if confirmPassword && !passwordMatch}
            <p class="text-xs text-red-500">Passwords do not match</p>
          {/if}
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              bind:checked={termsAccepted}
              required
              disabled={isLoading}
            />
            <Label for="terms" class="text-sm font-normal">
              I agree to the <a href="/terms" class="text-primary hover:underline">Terms and Conditions</a> *
            </Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="privacy" 
              bind:checked={privacyAccepted}
              required
              disabled={isLoading}
            />
            <Label for="privacy" class="text-sm font-normal">
              I agree to the <a href="/privacy" class="text-primary hover:underline">Privacy Policy</a> *
            </Label>
          </div>
          
          <div class="flex items-center space-x-2">
            <Checkbox 
              id="marketing" 
              bind:checked={marketingOptIn}
              disabled={isLoading}
            />
            <Label for="marketing" class="text-sm font-normal">
              I want to receive marketing emails and updates
            </Label>
          </div>
        </div>
        
        <Button 
          type="submit" 
          class="w-full" 
          disabled={isLoading}
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          {:else}
            Create Account
          {/if}
        </Button>
      </form>
    </div>
  </CardContent>
  
  <CardFooter class="justify-center">
    <p class="text-sm text-muted-foreground">
      Already have an account? 
      <a href="/signin" class="text-primary font-medium hover:underline">Sign in</a>
    </p>
  </CardFooter>
</Card>
