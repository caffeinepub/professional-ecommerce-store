import React, { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { Product, ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: product?.id || crypto.randomUUID(),
    name: product?.name || '',
    description: product?.description || '',
    price: product ? Number(product.price) / 100 : 0,
    stock: product ? Number(product.stock) : 0,
    category: product?.category || '',
  });

  const [images, setImages] = useState<ExternalBlob[]>(product?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedBlobs = await Promise.all(
        files.map(async (file) => {
          const buffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);
          return ExternalBlob.fromBytes(uint8Array);
        })
      );

      setImages((prev) => [...prev, ...uploadedBlobs]);
      toast.success(`Uploaded ${files.length} image(s)`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    if (formData.stock < 0) {
      toast.error('Stock cannot be negative');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      const productData: Product = {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        price: BigInt(Math.round(formData.price * 100)),
        stock: BigInt(formData.stock),
        category: formData.category,
        images,
        ratings: product?.ratings || [],
        reviewCount: product?.reviewCount || BigInt(0),
        purchases: product?.purchases || BigInt(0),
      };

      if (product) {
        await updateProduct.mutateAsync(productData);
        toast.success('Product updated successfully');
      } else {
        await addProduct.mutateAsync(productData);
        toast.success('Product added successfully');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const isPending = addProduct.isPending || updateProduct.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Electronics, Clothing, Home"
          required
        />
      </div>

      <div>
        <Label>Product Images *</Label>
        <div className="mt-2">
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative w-24 h-24 group">
                <img
                  src={img.getDirectURL()}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="flex-1"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Upload one or more product images (JPG, PNG, etc.)
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isPending || uploading} className="flex-1">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
