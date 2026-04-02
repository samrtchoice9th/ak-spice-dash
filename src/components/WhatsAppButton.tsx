import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  message: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  message,
  label = 'WhatsApp',
  variant = 'outline',
  size = 'sm',
  className,
}) => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone || cleanPhone.length < 7) return null;

  const url = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-1 ${className || ''}`}
      onClick={() => window.open(url, '_blank')}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
    </Button>
  );
};
