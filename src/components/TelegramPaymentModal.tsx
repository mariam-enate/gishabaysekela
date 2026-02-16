import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Send, Upload, Phone, Building2, Landmark, CheckCircle, ImageIcon, Copy, Check } from 'lucide-react';

interface TelegramPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TELEGRAM_LINK = 'https://t.me/educationtime';

const paymentAccounts = [
  {
    icon: Phone,
    name: 'Telebirr',
    account: '0920846316',
    holder: null,
    gradient: 'bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20',
    border: 'border-amber-500/30',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-500',
    accentBar: 'bg-gradient-to-b from-amber-400 to-orange-500',
  },
  {
    icon: Building2,
    name: 'CBE (Commercial Bank of Ethiopia)',
    account: '1000353216027',
    holder: 'Manaye Argachew',
    gradient: 'bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-500/20',
    border: 'border-blue-500/30',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-500',
    accentBar: 'bg-gradient-to-b from-blue-500 to-indigo-600',
  },
  {
    icon: Landmark,
    name: 'Abay Bank',
    account: '4421 0128 3032 2018',
    holder: 'Manaye Argachew',
    gradient: 'bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-green-500/20',
    border: 'border-emerald-500/30',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-500',
    accentBar: 'bg-gradient-to-b from-emerald-400 to-teal-600',
  },
];

export function TelegramPaymentModal({ open, onOpenChange }: TelegramPaymentModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleCopy = async (account: string) => {
    await navigator.clipboard.writeText(account.replace(/\s/g, ''));
    setCopiedAccount(account);
    toast({ title: 'Copied!', description: `${account} copied to clipboard.` });
    setTimeout(() => setCopiedAccount(null), 2000);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast({
        title: 'Receipt Required',
        description: 'Please upload your payment receipt before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Brief delay then redirect
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast({
      title: 'Payment Submitted! ✅',
      description: 'Redirecting you to the Telegram group...',
    });

    // Reset state
    setReceiptFile(null);
    setPreviewUrl(null);
    setIsSubmitting(false);
    onOpenChange(false);

    // Redirect to Telegram
    window.open(TELEGRAM_LINK, '_blank');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setReceiptFile(null);
      setPreviewUrl(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Join Telegram Group</DialogTitle>
          </div>
          <DialogDescription>
            Complete the payment below to access our Telegram group. Upload your receipt to proceed.
          </DialogDescription>
        </DialogHeader>

        {/* Payment Accounts */}
        <div className="space-y-3 mt-2">
          <p className="text-sm font-semibold text-foreground">Payment Options:</p>
          {paymentAccounts.map((account) => (
            <div
              key={account.name}
              className={`relative overflow-hidden rounded-xl border ${account.border} ${account.gradient} ${account.hoverGlow} transition-all duration-300 hover:scale-[1.03] cursor-default`}
            >
              {/* Accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${account.accentBar}`} />
              <div className="p-4 pl-5">
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${account.iconBg}`}>
                    <account.icon className={`h-5 w-5 ${account.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-foreground">{account.name}</p>
                    {account.holder && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Name: <span className="font-semibold text-foreground">{account.holder}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono font-bold text-foreground tracking-wider text-sm">
                        {account.account}
                      </span>
                      <button
                        onClick={() => handleCopy(account.account)}
                        className={`inline-flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-200 ${
                          copiedAccount === account.account
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'hover:bg-foreground/10 text-muted-foreground hover:text-foreground'
                        }`}
                        title="Copy account number"
                      >
                        {copiedAccount === account.account ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Receipt Upload */}
        <div className="space-y-3 mt-4">
          <p className="text-sm font-semibold text-foreground">Upload Payment Receipt:</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <img
                src={previewUrl}
                alt="Payment receipt"
                className="w-full max-h-48 object-contain bg-muted/30"
              />
              <div className="absolute top-2 right-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  Change
                </Button>
              </div>
              <div className="flex items-center gap-2 p-2 bg-success/10 border-t border-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-xs font-medium text-success">{receiptFile?.name}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Click to upload receipt screenshot
              </p>
              <p className="text-xs text-muted-foreground/70">PNG, JPG, or JPEG</p>
            </button>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!receiptFile || isSubmitting}
          className="w-full mt-2"
          size="lg"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit & Join Telegram
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
