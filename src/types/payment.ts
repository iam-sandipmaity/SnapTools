export interface PaymentDetails {
  razorpay_payment_id: string;
  amount: string;
  currency: string;
  status: string;
  timestamp: string;
  name?: string;
  email?: string;
  mobile?: string;
  message?: string;
}
