import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import {
  Heart,
  Coffee,
  Gift,
  AlertTriangle,
  Command,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Smile,
  ShieldQuestion,
  Copy,
  QrCode,
  X,
  CheckCircle2,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

declare const Razorpay: any;

const DonationPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    mobile: ""
  });
  const [confirmAnonymous, setConfirmAnonymous] = useState(false);
  const [useRandomMobile, setUseRandomMobile] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const validEmailDomains = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
    "msn.com", "protonmail.com", "zoho.com", "gmx.com", "yandex.com",
    "mail.com", "tutanota.com", "neomail.com", "titan.com", "rediffmail.com",
    "comcast.net", "icloud.com", "me.com", "mac.com", "mail.ru",
    "fastmail.com", "hushmail.com"
  ];

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    const domain = email.split('@')[1].toLowerCase();
    if (!validEmailDomains.includes(domain)) return "Please use a valid email domain";
    return "";
  };

  const generateRandomMobile = () => {
    return '+919999999999';
  };

  const handleDonate = (amount: number) => {
    if (!isAnonymous && (!name || !email || !mobile)) {
      setFormErrors({
        name: name ? "" : "Name is required",
        email: email ? "" : "Email is required",
        mobile: mobile ? "" : "Mobile number is required"
      });
      toast({
        title: "Information Required",
        description: "Please fill in your details to proceed with the donation.",
        variant: "destructive"
      });
      return;
    }

    if (isAnonymous && !confirmAnonymous) {
      setError("Please confirm the anonymous donation terms");
      return;
    }

    setIsProcessing(true);

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setIsProcessing(false);
      setError("Donations are not configured. Missing VITE_RAZORPAY_KEY_ID.");
      return;
    }

    let currentMobile = mobile;
    if (isAnonymous && useRandomMobile) {
      currentMobile = generateRandomMobile();
    }

    try {
      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: "INR",
        name: "SnapTools",
        description: message ? `${message}` : "Support SnapTools Innovation",
        prefill: isAnonymous ? {
          contact: useRandomMobile ? currentMobile : undefined
        } : {
          name,
          email,
          contact: mobile
        },
        handler: function (response: any) {
          setIsProcessing(false);
          const paymentDetails = {
            razorpay_payment_id: response.razorpay_payment_id,
            amount: amount.toString(),
            currency: "INR",
            status: "Successful",
            timestamp: new Date().toLocaleString(),
            name: isAnonymous ? undefined : name,
            email: isAnonymous ? undefined : email,
            mobile: isAnonymous ? (useRandomMobile ? currentMobile : undefined) : mobile,
            message: message
          };
          trackEvent({
            type: 'donation:success',
            amount: amount.toString(),
            currency: 'INR',
            payment_id: response.razorpay_payment_id
          });
          navigate('/payment-success', { state: { paymentDetails } });
        },
        theme: {
          color: "#000000"
        },
        modal: {
          confirm_close: true,
          escape: true,
          handleback: true,
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        toast({
          title: "Transaction Refused",
          description: "Your payment could not be processed. Please try another method.",
          variant: "destructive"
        });
      });
      rzp.open();
    } catch (error) {
      setIsProcessing(false);
      setError("Gateway Error: Could not initialize secure payment.");
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setCustomAmount(value);
      setError("");
      return;
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      setError("Numeric values only");
      return;
    }
    if (amount > 1000) {
      setError("Maximum donation cap: ₹1,000");
      return;
    }
    if (amount <= 0) {
      setError("Minimum contribution: ₹1");
      return;
    }
    setCustomAmount(value);
    setError("");
    if (!isNaN(amount) && amount > 0) {
      trackEvent({ type: 'donation:custom_amount_submitted', amount });
    }
  };

  // Support methods (UPI / BMC / BTC)
  const upiId = "sandipmaity@ptyes";
  const buyMeCoffeeUrl = "https://www.buymeacoffee.com/sandipmaity";
  const btcAddress = "bc1qexampledummyaddress0000000000000000000"; // dummy

  const copyToClipboard = async (value: string, label: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2500);
      trackEvent({ type: 'donation:copy', item: key as any });
      toast({ title: `${label} Copied`, description: `You can paste it into your payment app.`, variant: 'default' });
    } catch (e) {
      toast({ title: `Copy Failed`, description: `Could not copy ${label}.`, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Header />

      <main id="main-content" className="flex-grow pt-20 md:pt-32 pb-20 md:pb-40 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-[600px] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="site-container donate-wrapper">

          {/* HERO SECTION */}
          <header className="max-w-3xl mx-auto text-center mb-20 sm:mb-24 px-4 sm:px-0 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest mb-8">
              <Heart className="w-3 h-3 fill-current" />
              Empower Innovation
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-8 leading-[0.9]">
              Support the <br />
              <em className="italic font-light text-primary">Mission</em>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              SnapTools is fueled by community support. Your contribution keeps our high-performance infrastructure alive and free for everyone.
            </p>
          </header>

          <div className="grid lg:grid-cols-12 gap-16 items-start">

            {/* LEFT COLUMN: IMPACT & CARDS */}
            <div className="lg:col-span-12 grid md:grid-cols-3 gap-6 md:gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: Globe, title: "Global Edge", desc: "Help us maintain our worldwide CDN for millisecond tool latency." },
                { icon: ShieldCheck, title: "Zero Privacy", desc: "Support developers who prioritize your data security over profit." },
                { icon: Zap, title: "Fast Dev", desc: "Accelerate the development of and release of specialized technical tools." }
              ].map((item, i) => (
                <div key={i} className="group p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.04] transition-all duration-500 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* TECHNICAL SPONSORSHIP TIERS */}
            <div className="lg:col-span-12 mb-24 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tighter mb-4 text-center">Technical <em className="italic font-light text-primary">Sponsorships</em></h2>
                <div className="w-20 h-1 bg-primary/20 rounded-full" />
              </div>

              <div className="grid md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { tier: "Junior Dev", range: "₹1 - ₹49", features: ["Community Recognition", "Beta Access"] },
                  { tier: "Module Architect", range: "₹50 - ₹199", features: ["Priority Support", "Discord Role", "Early Features"] },
                  { tier: "System Guardian", range: "₹200 - ₹499", features: ["Core Contributor Badge", "Technical Newsletter", "Roadmap Voting"] },
                  { tier: "Enterprise Node", range: "₹500+", features: ["Official Partner Status", "Logo on Repository", "Private Consults"] }
                ].map((tier, i) => (
                  <div key={i} className="relative p-8 rounded-[2.5rem] bg-white/40 dark:bg-white/[0.01] border border-black/5 dark:border-white/10 hover:border-primary/30 transition-all duration-500 group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">{tier.range}</div>
                      <h4 className="text-xl font-bold mb-6 tracking-tight">{tier.tier}</h4>
                      <ul className="space-y-3">
                        {tier.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DONATION INTERFACE AREA */}
            <div className="lg:col-span-12 xl:col-span-7 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

                {/* Mode Selector */}
                <div className="flex p-1.5 bg-muted/50 dark:bg-white/[0.03] rounded-2xl mb-12">
                  <button
                    onClick={() => setIsAnonymous(false)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isAnonymous ? "bg-white dark:bg-black shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Regular Donation
                  </button>
                  <button
                    onClick={() => setIsAnonymous(true)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isAnonymous ? "bg-white dark:bg-black shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Anonymous Contribution
                  </button>
                </div>

                <div className="space-y-10">
                  {/* FORM FIELDS */}
                  {!isAnonymous && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-serif font-black tracking-tight">Donor Profile</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Display Name</label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Newman"
                            className="bg-muted/30 dark:bg-white/[0.01] border-border/50 h-14 rounded-2xl px-6 focus:ring-primary/20"
                          />
                          {formErrors.name && <p className="text-[10px] text-destructive font-bold uppercase ml-2">{formErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Secure Email</label>
                          <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alex@example.com"
                            className="bg-muted/30 dark:bg-white/[0.01] border-border/50 h-14 rounded-2xl px-6 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-2">Contact Protocol (For updates)</label>
                        <Input
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+91 0000 0000 00"
                          className="bg-muted/30 dark:bg-white/[0.01] border-border/50 h-14 rounded-2xl px-6 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}

                  {isAnonymous && (
                    <div className="space-y-8 p-6 sm:p-8 rounded-3xl bg-primary/5 border border-primary/10">
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold mb-2">Privacy Shield Active</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">Your identity will be scrubbed from our public supporter records. No receipt will be generated for your email.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={confirmAnonymous}
                              onChange={(e) => setConfirmAnonymous(e.target.checked)}
                            />
                            <div className="w-6 h-6 rounded-lg border-2 border-border peer-checked:bg-primary peer-checked:border-primary transition-all" />
                            <ChevronRight className="absolute inset-0 w-4 h-4 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm font-medium">I understand the anonymous protocol</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={useRandomMobile}
                            onChange={(e) => setUseRandomMobile(e.target.checked)}
                          />
                          <div className="w-6 h-6 rounded-lg border-2 border-border peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all" />
                          <AlertTriangle className="absolute inset-x-8 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Randomize payment identifier</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <h3 className="text-2xl font-serif font-black tracking-tight">Select Amount</h3>
                      {!showCustomAmount ? (
                        <button
                          onClick={() => setShowCustomAmount(true)}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline"
                        >
                          Different Amount?
                        </button>
                      ) : (
                        <button
                          onClick={() => { setShowCustomAmount(false); setCustomAmount(""); }}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                        >
                          Back to Presets
                        </button>
                      )}
                    </div>

                    {!showCustomAmount ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[5, 10, 25, 50].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => {
                              trackEvent({ type: 'donation:amount_selected', amount: amt });
                              handleDonate(amt);
                            }}
                            disabled={isProcessing}
                            className="h-20 rounded-2xl border border-black/5 dark:border-white/5 bg-muted/30 dark:bg-white/[0.02] hover:bg-primary hover:text-white transition-all duration-300 font-serif font-black text-2xl group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="relative z-10 transition-transform group-hover:scale-110 block">₹{amt}</span>
                            <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-serif font-black text-primary">₹</div>
                        <Input
                          type="number"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          placeholder="0.00"
                          className="h-24 pl-14 pr-40 text-4xl font-serif font-black bg-muted/30 dark:bg-white/[0.01] border-primary/20 rounded-3xl focus:ring-primary/20 text-foreground"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Button
                            onClick={() => handleDonate(parseFloat(customAmount))}
                            disabled={!!error || !customAmount || isProcessing}
                            className="h-16 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                          >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isProcessing ? "Processing..." : <>Contribute <ArrowRight className="w-4 h-4 ml-2" /></>}
                          </Button>
                        </div>
                        {error && <p className="text-[10px] text-destructive font-bold uppercase mt-2 ml-4">{error}</p>}
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-border">
                    <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-widest leading-relaxed">
                      Securely processed by Razorpay Engine. <br />
                      SnapTools is a community-owned platform. Razorpay processes the details you enter for the donation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ADDITIONAL CONTEXT */}
            <div className="lg:col-span-5 space-y-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>

              {/* OTHER WAYS TO SUPPORT */}
              <div className="p-6 sm:p-8 rounded-[2rem] border border-border bg-white/50 dark:bg-white/[0.01] backdrop-blur-3xl">
                <h3 className="text-2xl font-serif font-black mb-4 tracking-tight">Other Ways to Support</h3>
                <p className="text-sm text-muted-foreground mb-6">Prefer an alternate method? Copy the details below and pay using your preferred wallet or platform.</p>

                <div className="grid gap-4">
                  {/* UPI Card */}
                  <div className="rounded-xl border border-black/5 dark:border-white/5 bg-muted/30 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 shrink-0 rounded-lg bg-white dark:bg-white flex items-center justify-center p-1.5 border border-black/10">
                          <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <polygon points="0,70 28,10 38,10 10,70" fill="#F37021" />
                            <polygon points="22,70 50,10 60,10 32,70" fill="#8CC63F" />
                            <path d="M80 12 L80 42 Q80 56 94 56 Q108 56 108 42 L108 12" stroke="#097FDB" strokeWidth="7" fill="none" strokeLinecap="round" />
                            <path d="M120 12 L120 56 M120 12 Q148 12 148 30 Q148 48 120 48" stroke="#097FDB" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="162" y1="12" x2="162" y2="56" stroke="#097FDB" strokeWidth="7" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold">UPI ID</div>
                          <div className="text-xs text-muted-foreground">Pay instantly from any UPI app</div>
                          <div className="text-sm font-mono text-foreground/90 mt-1 break-all">{upiId}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 self-start sm:self-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-10 px-3 tap-target-min"
                            >
                              <QrCode className="w-4 h-4" />
                              <span className="ml-2 text-xs">QR</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md rounded-[2.5rem]">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-serif font-black">Scan to Support</DialogTitle>
                              <DialogDescription>
                                Open any UPI app (GPay, PhonePe, Paytm) to complete the transaction.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-6 py-6">
                              <div className="p-4 bg-white rounded-3xl shadow-xl border border-black/5">
                                <QRCodeCanvas
                                  id="upi-qr-code"
                                  value={`upi://pay?pa=${upiId}&pn=SnapTools&cu=INR`}
                                  size={200}
                                  level="H"
                                  includeMargin={true}
                                />
                              </div>
                              <div className="flex flex-col w-full gap-3">
                                <a
                                  href={`upi://pay?pa=${upiId}&pn=SnapTools&cu=INR`}
                                  className="w-full"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Button className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2">
                                    <Zap className="w-4 h-4" />
                                    Open in UPI App
                                  </Button>
                                </a>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    const canvas = document.getElementById('upi-qr-code') as HTMLCanvasElement;
                                    if (canvas) {
                                      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                                      let downloadLink = document.createElement("a");
                                      downloadLink.href = pngUrl;
                                      downloadLink.download = "snaptools-upi-qr.png";
                                      document.body.appendChild(downloadLink);
                                      downloadLink.click();
                                      document.body.removeChild(downloadLink);
                                      trackEvent({ type: 'donation:copy', item: 'receipt' }); // Mocked for download
                                    }
                                  }}
                                  className="h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Download QR
                                </Button>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-border flex items-center justify-between">
                              <code className="text-[10px] font-mono bg-muted px-2 py-1 rounded-md">{upiId}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(upiId, 'UPI ID', 'upi')}
                                className="h-8 text-[10px] font-black uppercase tracking-widest"
                              >
                                {copiedStates['upi'] ? "Copied!" : "Copy ID"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(upiId, 'UPI ID', 'upi')}
                          className="h-10 px-3 min-w-[100px] tap-target-min transition-all"
                        >
                          {copiedStates['upi'] ? (
                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          <span className="text-xs">{copiedStates['upi'] ? "Copied" : "Copy"}</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Buy Me a Coffee */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-black/5 dark:border-white/5 bg-muted/30">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-amber-200/20 flex items-center justify-center text-amber-500">
                        <Coffee className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold">Buy Me a Coffee</div>
                        <div className="text-xs text-muted-foreground">Small one-time support via BuyMeACoffee</div>
                      </div>
                    </div>
                    <a href={buyMeCoffeeUrl} target="_blank" rel="noreferrer" className="shrink-0 self-start sm:self-center">
                      <Button className="h-10 px-4 tap-target-min">Support ☕</Button>
                    </a>
                  </div>

                  {/* BTC Wallet */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-black/5 dark:border-white/5 bg-muted/30">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 shrink-0 rounded-lg bg-yellow-100/10 flex items-center justify-center text-yellow-400">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold">BTC Wallet</div>
                        <div className="text-xs text-muted-foreground">Send BTC to support long-term infrastructure</div>
                        <div className="text-xs font-mono text-foreground/90 mt-1 break-all">{btcAddress}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(btcAddress, 'BTC Address', 'btc')}
                      className="h-10 px-3 shrink-0 self-start sm:self-center min-w-[100px] tap-target-min transition-all"
                    >
                      {copiedStates['btc'] ? (
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      <span className="text-xs">{copiedStates['btc'] ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-primary/[0.02] border border-primary/10 rounded-[3rem] p-6 sm:p-10 relative overflow-hidden">
                <Smile className="absolute -right-10 -bottom-10 w-48 h-48 text-primary opacity-[0.05]" />
                <h3 className="text-2xl font-serif font-black mb-6 tracking-tight">The Impact</h3>
                <ul className="space-y-6">
                  {[
                    "Keep SnapTools free of intrusive corporate ads.",
                    "Fund development of the Pro suite of design validators.",
                    "Expand our engineering team for 24/7 technical support."
                  ].map((text, i) => (
                    <li key={i} className="flex gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-foreground/80 leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 sm:p-8 rounded-[3rem] border border-border bg-white/50 dark:bg-white/[0.01] backdrop-blur-3xl">
                <ShieldQuestion className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-2xl font-serif font-black mb-4 tracking-tight">Questions?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-10">
                  Encountering an issue with the payment gateway or want to discuss a corporate sponsorship? Our engineers are ready to assist.
                </p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border-primary/20 hover:bg-primary hover:text-white transition-all">
                    Technical Support Panel
                  </Button>
                </Link>
              </div>

            </div>

            {/* DONOR RECOGNITION CLUSTER */}
            <div className="lg:col-span-12 mt-32 mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-black/5 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[4rem] p-8 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />

                <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tighter mb-8 leading-none">
                      Ecosystem <br />
                      <em className="text-primary font-light italic">Supporters</em>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                      Our infrastructure is validated by a global network of technical sponsors. Join the cluster of visionaries keeping the workstation online.
                    </p>
                    <div className="flex gap-4">
                      <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-muted flex items-center justify-center font-black text-xs overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                          </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-background bg-primary text-white flex items-center justify-center font-black text-xs">
                          +12k
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-[400px] flex items-center justify-center">
                    {/* Glassmorphic Nodes Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 rounded-full border border-primary/10 animate-[spin_20s_linear_infinite]" />
                      <div className="w-full h-full absolute inset-0 rounded-full border border-primary/5 animate-[spin_35s_linear_infinite_reverse]" />
                    </div>

                    {[
                      { label: "V. Sharma", role: "Guardian", top: "10%", left: "20%" },
                      { label: "Node_84", role: "Architect", top: "40%", left: "70%" },
                      { label: "Anon_User", role: "Supporter", top: "75%", left: "15%" },
                      { label: "Tech_Flow", role: "Sponsor", top: "15%", left: "60%" },
                      { label: "Dev_Core", role: "Guardian", top: "80%", left: "55%" }
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 + (i * 0.1) }}
                        className="absolute p-4 rounded-2xl bg-white/10 dark:bg-white/[0.05] backdrop-blur-xl border border-white/20 shadow-xl group hover:scale-110 transition-transform cursor-default"
                        style={{ top: node.top, left: node.left }}
                      >
                        <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">{node.role}</div>
                        <div className="text-xs font-bold whitespace-nowrap">{node.label}</div>
                      </motion.div>
                    ))}

                    <div className="relative z-10 w-32 h-32 rounded-3xl bg-primary/20 backdrop-blur-3xl border border-primary/30 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.3)]">
                      <Command className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default DonationPage;