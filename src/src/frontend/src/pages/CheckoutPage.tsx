import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CreditCard, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { ShoppingItem } from '../backend';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const { data: isStripeConfigured, isLoading: checkingStripe } = useIsStripeConfigured();
  const createCheckout = useCreateCheckoutSession();
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    navigate({ to: '/cart' });
    return null;
  }

  const handleCheckout = async () => {
    if (!isStripeConfigured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    try {
      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.product.name,
        productDescription: item.product.description,
        priceInCents: item.product.price,
        quantity: BigInt(item.quantity),
        currency: 'usd',
      }));

      const session = await createCheckout.mutateAsync(shoppingItems);
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/20">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>

        {!checkingStripe && !isStripeConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Payment system is not configured. Please contact the administrator to set up Stripe.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-serif font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const priceDisplay = (Number(item.product.price) / 100).toFixed(2);
                  const subtotal = (Number(item.product.price) * item.quantity) / 100;
                  const imageUrl = item.product.images[0]?.getDirectURL();

                  return (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${priceDisplay} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 mt-6 bg-accent/10">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Secure Checkout</h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is processed securely through Stripe. We do not store
                    your credit card details.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-serif font-semibold mb-4">Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${(totalPrice / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={checkingStripe || !isStripeConfigured || isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay with Stripe
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By completing this purchase, you agree to our terms of service.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
