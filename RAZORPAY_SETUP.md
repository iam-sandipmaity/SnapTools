# Razorpay Integration Setup

> Configuration guide for enabling payment functionality in the SnapTools donation system.

## 🚀 Setup Instructions

To enable payments in the donation system, you'll need to set up Razorpay integration:

1. Sign up for a Razorpay account at https://razorpay.com

2. Get your API credentials from the Razorpay Dashboard:
   - Key ID
   - Key Secret

3. Add the following environment variables to your `.env` file:
   ```
   RAZORPAY_KEY_ID=your_key_id_here
   RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

4. Add the Razorpay script to your `index.html`:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

## Testing

For testing, you can use Razorpay's test mode credentials. In test mode, you can use any card number for testing payments.

Test Card Details:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

## Support

For any issues with the payment integration, please refer to:
- [Razorpay Documentation](https://razorpay.com/docs)
- [Razorpay Support](https://razorpay.com/support)