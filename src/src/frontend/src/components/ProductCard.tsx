import React from 'react';
import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product, ExternalBlob } from '../backend';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const averageRating =
    product.ratings.length > 0
      ? Number(product.ratings.reduce((a, b) => a + b, BigInt(0))) / product.ratings.length / 100
      : 0;

  const priceDisplay = (Number(product.price) / 100).toFixed(2);
  const imageUrl = product.images[0]?.getDirectURL();

  return (
    <Link to="/product/$id" params={{ id: product.id }}>
      <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 h-full">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {Number(product.stock) === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-serif text-lg font-semibold line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({Number(product.reviewCount)})
              </span>
            </div>
            <span className="text-lg font-semibold text-primary">${priceDisplay}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
