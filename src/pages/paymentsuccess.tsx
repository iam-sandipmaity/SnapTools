import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Share2, CheckCircle2, ArrowLeft, Copy, Command, ShieldCheck, Zap } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { generateReceiptImage } from '@/utils/receipt-generator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/components/ui/breadcrumbs';
import { toast } from 'sonner';
import { track } from '@vercel/analytics';
import type { PaymentDetails } from '@/types/payment';

export type { PaymentDetails };

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentDetails = location.state?.paymentDetails as PaymentDetails | undefined;
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!paymentDetails) {
      navigate('/donate', { replace: true });
    }
  }, [paymentDetails, navigate]);

  if (!paymentDetails) {
    return null;
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(paymentDetails.razorpay_payment_id);
    setIsCopied(true);
    toast.success("Payment ID copied to clipboard");
    track('payment_id_copied', { id: paymentDetails.razorpay_payment_id });
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleDownload = async () => {
    try {
      const receiptImage = await generateReceiptImage(paymentDetails);
      const element = document.createElement('a');
      element.href = receiptImage;
      element.download = `snaptools-receipt-${paymentDetails.razorpay_payment_id}.png`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Receipt downloaded successfully");
      track('receipt_downloaded', { id: paymentDetails.razorpay_payment_id });
    } catch (error) {
      toast.error("Failed to generate receipt");
    }
  };

  const handleShare = async () => {
    try {
      const receiptImage = await generateReceiptImage(paymentDetails);
      const blob = await (await fetch(receiptImage)).blob();
      const file = new File([blob], `receipt-${paymentDetails.razorpay_payment_id}.png`, {
        type: blob.type,
      });

      const shareText = `I just supported SnapTools with a donation of ${paymentDetails.amount} ${paymentDetails.currency}! Check out these awesome free tools.`;

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'SnapTools Support Receipt',
          text: shareText,
          files: [file]
        });
        track('milestone_shared', { method: 'native_share', id: paymentDetails.razorpay_payment_id });
      } else {
        await navigator.clipboard.writeText(`${shareText} https://snaptools.xyz`);
        toast.success("Share link copied to clipboard");
        track('milestone_shared', { method: 'clipboard', id: paymentDetails.razorpay_payment_id });
      }
    } catch (error) {
      toast.error("Sharing failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <main className="flex-grow relative overflow-hidden pt-32 pb-40">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/[0.02] blur-[120px] -z-10" />

        <div className="container max-w-4xl mx-auto px-6">
          <Breadcrumbs
            items={[
              { label: "Donate", href: "/donate" },
              { label: "Success" }
            ]}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-primary/20"
              >
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </motion.div>
              <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4">
                <ShieldCheck className="w-3 h-3" />
                Transaction Authenticated
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9] mb-6">
                Gratitude <br />
                <em className="italic font-light text-primary text-4xl md:text-6xl">Initialized</em>
              </h1>
              <p className="text-xl text-muted-foreground/80 max-w-xl mx-auto font-medium leading-relaxed">
                Your contribution fuels the development of high-performance utilities for the global community.
              </p>
            </div>

            <Card className="rounded-[3rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden relative isolate">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="group">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Internal Receipt ID</p>
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <code className="text-xs font-mono font-bold truncate max-w-[180px]">{paymentDetails.razorpay_payment_id}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={handleCopyId}
                        >
                          {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end border-b border-black/5 dark:border-white/5 pb-4">
                        <span className="text-sm font-medium text-muted-foreground">Amount</span>
                        <span className="text-2xl font-serif font-black">{paymentDetails.amount} {paymentDetails.currency}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4 text-sm font-medium">
                        <span className="text-muted-foreground">Date & Time</span>
                        <span>{paymentDetails.timestamp}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4 text-sm font-medium">
                        <span className="text-muted-foreground">Source</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                          <Zap className="w-3 h-3" />
                          Direct Authorization
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center gap-2 mb-4 text-primary font-black text-[10px] uppercase tracking-widest">
                          <Command className="w-3 h-3" />
                          Contributor Node
                        </div>
                        <div className="space-y-4">
                          {paymentDetails.name && (
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Entity</p>
                              <p className="font-bold">{paymentDetails.name}</p>
                            </div>
                          )}
                          {paymentDetails.email && (
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Registry Email</p>
                              <p className="font-bold text-sm truncate">{paymentDetails.email}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-8">
                        <div className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 italic text-sm text-muted-foreground leading-relaxed">
                          "{paymentDetails.message || "Your support helps us keep SnapTools free for everyone."}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 pt-12 border-t border-black/5 dark:border-white/5">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Archive Receipt
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-black/10 dark:border-white/10 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Milestone
                  </Button>
                  <Button
                    onClick={() => navigate('/tools')}
                    variant="ghost"
                    className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Suite
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
