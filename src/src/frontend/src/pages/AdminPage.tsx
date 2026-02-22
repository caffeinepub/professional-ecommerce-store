import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Crown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductsAdmin } from '../components/admin/ProductsAdmin';
import { StripeConfigAdmin } from '../components/admin/StripeConfigAdmin';
import { UserDatabaseAdmin } from '../components/admin/UserDatabaseAdmin';
import { Button } from '@/components/ui/button';

export function AdminPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const { identity, login } = useInternetIdentity();

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to access the admin dashboard.
          </p>
          <Button onClick={login} size="lg">
            Login
          </Button>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard. Only administrators can view
            this page.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Prominent Admin Status Banner */}
        <Alert className="mb-6 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-base font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Admin Access Confirmed - You are logged in as the administrator of this store
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-serif font-bold">Admin Dashboard</h1>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            Welcome to the admin dashboard. Here you can manage products, view registered users, and configure payment
            settings.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">User Database</TabsTrigger>
            <TabsTrigger value="stripe">Stripe Config</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <ProductsAdmin />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserDatabaseAdmin />
          </TabsContent>

          <TabsContent value="stripe" className="mt-6">
            <StripeConfigAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
