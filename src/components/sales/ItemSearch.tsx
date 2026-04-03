import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useProducts } from '@/contexts/ProductsContext';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ItemSearchProps {
  value: string;
  hasError?: boolean;
  errorMessage?: string;
  onSelect: (name: string, price: number) => void;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}

export const ItemSearch: React.FC<ItemSearchProps> = React.memo(({
  value,
  hasError,
  errorMessage,
  onSelect,
  onChange,
  onKeyDown,
  inputRef,
}) => {
  const { products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<typeof products>([]);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setFiltered([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      const q = value.toLowerCase();
      const results = products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 10);
      setFiltered(results);
      setIsOpen(results.length > 0);
      setHighlightIdx(-1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, products]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectItem = useCallback((product: typeof products[0]) => {
    onSelect(product.name, product.price);
    setIsOpen(false);
  }, [onSelect]);

  const handleKeyDownInternal = useCallback((e: React.KeyboardEvent) => {
    if (isOpen && filtered.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIdx(prev => Math.min(prev + 1, filtered.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIdx(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter' && highlightIdx >= 0) {
        e.preventDefault();
        selectItem(filtered[highlightIdx]);
        return;
      }
    }
    onKeyDown(e);
  }, [isOpen, filtered, highlightIdx, selectItem, onKeyDown]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDownInternal}
        onFocus={() => { if (filtered.length > 0) setIsOpen(true); }}
        placeholder="Search item..."
        className={cn(
          "h-9 text-sm",
          hasError && "border-destructive ring-destructive"
        )}
        autoComplete="off"
      />
      {hasError && errorMessage && (
        <span className="text-xs text-destructive mt-0.5 block">{errorMessage}</span>
      )}
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((product, idx) => (
            <button
              key={product.id}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-sm flex justify-between hover:bg-accent",
                idx === highlightIdx && "bg-accent"
              )}
              onMouseDown={() => selectItem(product)}
            >
              <span className="text-foreground">{product.name}</span>
              <span className="text-muted-foreground">Rs.{product.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

ItemSearch.displayName = 'ItemSearch';
