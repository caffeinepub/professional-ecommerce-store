import React, { useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '../contexts/CartContext';
import { useGetStripeSessionStatus } from '../hooks/useQueries';

export function SuccessPage() {
  const { clearCart } = useCart();
  const search = useSearch({ strict: false }) as { session_id?: string };
  const sessionId = search.session_id;

  const { data: sessionStatus } = useGetStripeSessionStatus(sessionId || null);

  useEffect(() => {
    if (sessionStatus?.__kind__ === 'completed') {
      clearCart();
    }
  }, [sessionStatus, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {sessionId && (
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Order ID: {sessionId.slice(0, 16)}...</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/products">
            <Button size="lg" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
