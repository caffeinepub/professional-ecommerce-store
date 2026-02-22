import React, { useState, useMemo } from 'react';
import { Users, Search, Calendar, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListAllUserContacts } from '../../hooks/useQueries';

export function UserDatabaseAdmin() {
  const { data: users, isLoading } = useListAllUserContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'registered' | 'email' | 'name'>('registered');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1_000_000); // nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Truncate principal ID (show first 10 + "..." + last 6 chars)
  const truncatePrincipal = (principal: string): string => {
    if (principal.length <= 20) return principal;
    return `${principal.slice(0, 10)}...${principal.slice(-6)}`;
  };

  // Truncate long text
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text || text.length <= maxLength) return text || '—';
    return `${text.slice(0, maxLength)}...`;
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    if (!users) return [];

    // Filter
    const filtered = users.filter((user) => {
      const query = searchQuery.toLowerCase();
      return (
        user.email.toLowerCase().includes(query) ||
        user.fullName.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query) ||
        user.principal.toString().toLowerCase().includes(query)
      );
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'registered':
          compareResult = Number(a.registered - b.registered);
          break;
        case 'email':
          compareResult = a.email.localeCompare(b.email);
          break;
        case 'name':
          compareResult = a.fullName.localeCompare(b.fullName);
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return sorted;
  }, [users, searchQuery, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Database
            </CardTitle>
            <CardDescription>
              View all registered users and their contact information
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {users?.length || 0} {users?.length === 1 ? 'User' : 'Users'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, phone, or principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No users found' : 'No users registered yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Users will appear here once they create their profiles'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('registered')}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Registered
                        {sortBy === 'registered' && (
                          <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Principal ID
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                        {sortBy === 'email' && (
                          <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Full Name
                        {sortBy === 'name' && (
                          <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Address
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.principal.toString()}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(user.registered)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {truncatePrincipal(user.principal.toString())}
                        </code>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${user.email}`}
                          className="text-primary hover:underline"
                        >
                          {user.email}
                        </a>
                      </TableCell>
                      <TableCell>{truncateText(user.fullName) || '—'}</TableCell>
                      <TableCell>
                        {user.phone ? (
                          <a
                            href={`tel:${user.phone}`}
                            className="text-primary hover:underline"
                          >
                            {user.phone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" title={user.address}>
                          {truncateText(user.address, 40)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
