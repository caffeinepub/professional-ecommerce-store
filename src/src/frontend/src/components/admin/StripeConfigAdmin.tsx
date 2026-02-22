import React, { useState } from 'react';
import { CreditCard, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../../hooks/useQueries';
import { toast } from 'sonner';

export function StripeConfigAdmin() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US, CA, GB, AU, NZ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    if (!secretKey.startsWith('sk_')) {
      toast.error('Invalid Stripe secret key format. It should start with "sk_"');
      return;
    }

    const countryList = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countryList.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countryList,
      });
      toast.success('Stripe configuration saved successfully');
      setSecretKey('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save Stripe configuration');
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-semibold mb-2">Stripe Payment Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure your Stripe account to enable payment processing
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </Card>
      ) : (
        <>
          {isConfigured && (
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertDescription>
                Stripe is configured and ready to process payments. You can update your
                configuration below if needed.
              </AlertDescription>
            </Alert>
          )}

          {!isConfigured && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Stripe is not configured. Payment processing is currently disabled. Please configure
                your Stripe account below.
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="secretKey">Stripe Secret Key</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="sk_test_... or sk_live_..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your Stripe secret key. You can find this in your{' '}
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    Stripe Dashboard
                  </a>
                  . Start with test keys (sk_test_...) before using live keys.
                </p>
              </div>

              <div>
                <Label htmlFor="countries">Allowed Countries</Label>
                <Input
                  id="countries"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  placeholder="US, CA, GB, AU, NZ"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter comma-separated 2-letter country codes (ISO 3166-1 alpha-2). Example: US,
                  CA, GB, DE, FR
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm">Quick Setup Guide:</h3>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>
                    Create a Stripe account at{' '}
                    <a
                      href="https://stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      stripe.com
                    </a>
                  </li>
                  <li>Navigate to the Developers section and click on API keys</li>
                  <li>Copy your Secret key (starts with sk_test_ or sk_live_)</li>
                  <li>Paste it in the field above and configure allowed countries</li>
                  <li>Click Save Configuration to enable payment processing</li>
                </ol>
              </div>

              <Button type="submit" disabled={setConfig.isPending} className="w-full">
                {setConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CreditCard className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
}
