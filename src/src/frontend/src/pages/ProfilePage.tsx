import React, { useState, useEffect } from 'react';
import { User, Save, Mail, Phone, MapPin, UserCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyContactInfo, useSaveMyContactInfo } from '../hooks/useQueries';
import { toast } from 'sonner';

export function ProfilePage() {
  const { identity, login } = useInternetIdentity();
  const { data: profileData, isLoading: isLoadingProfile } = useGetMyContactInfo();
  const saveProfile = useSaveMyContactInfo();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        email: profileData.email || '',
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
      });
    }
  }, [profileData]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await saveProfile.mutateAsync({
        email: formData.email.trim(),
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center">
          <UserCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            Please login to view and edit your profile.
          </p>
          <Button onClick={login} size="lg">
            Login
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-muted/30">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-serif font-bold">My Profile</h1>
        </div>

        <Alert className="mb-6">
          <AlertDescription>
            Keep your contact information up to date. This information may be used for order
            confirmations and communication.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Manage your profile details. All fields except email are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field - Required */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Full Name Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
              </div>

              {/* Phone Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>

              {/* Address Field - Optional */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Main Street&#10;Apartment 4B&#10;New York, NY 10001"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saveProfile.isPending}
                  className="flex-1"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Principal ID Display */}
        {identity && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Internet Identity Principal</CardTitle>
              <CardDescription className="break-all text-xs font-mono">
                {identity.getPrincipal().toString()}
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
