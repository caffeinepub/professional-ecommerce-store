import React from 'react';
import { Link } from '@tanstack/react-router';
import { ShoppingCart, User, Store, Crown, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCart } from '../contexts/CartContext';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { UserRole } from '../backend';
import { useQueryClient } from '@tanstack/react-query';

export function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { totalItems } = useCart();
  const { data: userRole, refetch: refetchUserRole } = useGetCallerUserRole();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Refetch user role when login succeeds
  React.useEffect(() => {
    if (loginStatus === 'success' && identity) {
      refetchUserRole();
    }
  }, [loginStatus, identity, refetchUserRole]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-2xl font-serif font-semibold">Boutique</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Products
          </Link>
          {userRole === UserRole.admin && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && userRole && (
            <Badge 
              variant={userRole === UserRole.admin ? 'default' : 'secondary'}
              className={userRole === UserRole.admin ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 text-sm flex items-center gap-1.5' : ''}
            >
              {userRole === UserRole.admin && <Crown className="h-4 w-4" />}
              {userRole === UserRole.admin ? 'ADMINISTRATOR' : userRole}
            </Badge>
          )}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Account
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleAuth}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant="default"
              size="sm"
            >
              <User className="mr-2 h-4 w-4" />
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
