import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          © 2026. Built with{' '}
          <Heart className="inline h-4 w-4 text-red-500 fill-red-500" />{' '}
          using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-4"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
