# Razorpay Payment Integration - Testing Guide

## Pre-Testing Checklist

- [ ] Backend server is running on `http://localhost:5000`
- [ ] Frontend is running on `http://localhost:5173`
- [ ] PostgreSQL database is running
- [ ] `.env` file has Razorpay test keys configured
- [ ] User is logged in
- [ ] Cart has items added

## Test Scenarios

### 1. Successful Payment with Card

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "Credit/Debit Cards" payment method
5. Click "Pay ₹[amount]"
6. In Razorpay modal, enter test card: `4111111111111111`
7. Enter any future expiry date (e.g., 12/25)
8. Enter any 3-digit CVV (e.g., 123)
9. Click "Pay"

**Expected Result:**
- Payment should succeed
- Order should be created
- Order confirmation page should appear
- Order status should be "confirmed"
- Payment status should be "completed"

**Verification:**
```sql
SELECT id, order_number, status, payment_status, razorpay_payment_id 
FROM public.orders 
WHERE user_id = 'your_user_id' 
ORDER BY created_at DESC 
LIMIT 1;
```

### 2. Failed Payment with Card

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "Credit/Debit Cards" payment method
5. Click "Pay ₹[amount]"
6. In Razorpay modal, enter test card: `4000000000000002`
7. Enter any future expiry date
8. Enter any 3-digit CVV
9. Click "Pay"

**Expected Result:**
- Payment should fail
- Error message should appear
- Order should NOT be created
- User should be able to retry

### 3. Payment Cancellation

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "Credit/Debit Cards" payment method
5. Click "Pay ₹[amount]"
6. In Razorpay modal, click close button or press Escape

**Expected Result:**
- Modal should close
- "Payment Cancelled" notification should appear
- Cart should remain intact
- User should be able to retry

### 4. UPI Payment

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "UPI" payment method
5. Click "Pay ₹[amount]"
6. In Razorpay modal, enter UPI ID: `success@razorpay`
7. Click "Pay"

**Expected Result:**
- Payment should succeed
- Order should be created
- Order confirmation page should appear

### 5. Net Banking Payment

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "Net Banking" payment method
5. Click "Pay ₹[amount]"
6. In Razorpay modal, select a bank
7. Complete payment

**Expected Result:**
- Payment should succeed
- Order should be created

### 6. Cash on Delivery

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "Cash on Delivery" payment method
5. Click "Place Order"

**Expected Result:**
- Order should be created immediately
- Order status should be "pending"
- Payment status should be "pending"
- No Razorpay modal should appear

### 7. Wallet Payment

**Steps:**
1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Select "Wallets" payment method
5. Click "Pay ₹[amount]"
6. In Razorpay modal, select wallet provider
7. Complete payment

**Expected Result:**
- Payment should succeed
- Order should be created

## Error Scenarios

### 1. Missing Authentication Token

**Steps:**
1. Clear localStorage
2. Try to proceed to payment

**Expected Result:**
- Error message: "Authentication token not found. Please login again."

### 2. Invalid Amount

**Steps:**
1. Manually modify amount to 0 or negative
2. Try to proceed to payment

**Expected Result:**
- Error message: "Invalid amount"

### 3. Razorpay SDK Not Loaded

**Steps:**
1. Block Razorpay script in browser DevTools
2. Try to proceed to payment

**Expected Result:**
- Error message: "Payment service is not available"

### 4. Network Error

**Steps:**
1. Disconnect internet
2. Try to proceed to payment

**Expected Result:**
- Error message about network failure
- User should be able to retry

## Console Logging

### Expected Console Logs

**Successful Payment:**
```
Initiating payment: {amount: 1500.50, currency: "INR", method: "card"}
Order created successfully: {orderId: "order_1234567890abcd"}
Opening Razorpay checkout...
Payment response received: {orderId: "order_1234567890abcd", paymentId: "pay_1234567890abcd"}
Payment verified successfully: {paymentId: "pay_1234567890abcd", status: "captured"}
```

**Failed Payment:**
```
Payment failed: {code: "BAD_REQUEST_ERROR", description: "Payment failed"}
```

## Database Verification

### Check Order Status

```sql
SELECT 
  id,
  order_number,
  status,
  payment_status,
  razorpay_order_id,
  razorpay_payment_id,
  total_amount,
  created_at
FROM public.orders
WHERE user_id = 'your_user_id'
ORDER BY created_at DESC
LIMIT 5;
```

### Check Payment Logs

```sql
SELECT 
  id,
  order_id,
  event_type,
  status,
  amount,
  error_message,
  created_at
FROM public.payment_logs
ORDER BY created_at DESC
LIMIT 10;
```

## Performance Testing

### Load Testing

1. Simulate multiple concurrent payments
2. Monitor backend response times
3. Check database query performance
4. Verify no race conditions

### Stress Testing

1. Test with maximum order amount (₹10,00,000)
2. Test with minimum order amount (₹1)
3. Test with large number of items
4. Monitor memory usage

## Security Testing

### 1. Signature Verification

- [ ] Verify signature validation works
- [ ] Test with invalid signature
- [ ] Test with modified order ID
- [ ] Test with modified payment ID

### 2. Authentication

- [ ] Test without token
- [ ] Test with invalid token
- [ ] Test with expired token
- [ ] Test with different user's token

### 3. Amount Validation

- [ ] Test with amount > ₹10,00,000
- [ ] Test with negative amount
- [ ] Test with zero amount
- [ ] Test with decimal amount

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Mobile Testing

### iOS

- [ ] Test on iPhone with Safari
- [ ] Test on iPhone with Chrome
- [ ] Test payment method selection
- [ ] Test modal responsiveness

### Android

- [ ] Test on Android with Chrome
- [ ] Test on Android with Firefox
- [ ] Test payment method selection
- [ ] Test modal responsiveness

## Checklist for Production

Before deploying to production:

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Database records are correct
- [ ] Payment verification works
- [ ] Error handling is robust
- [ ] Mobile responsiveness verified
- [ ] Security tests passed
- [ ] Performance acceptable
- [ ] Live keys configured
- [ ] Webhook URL configured
- [ ] Monitoring set up
- [ ] Backup payment method ready

## Troubleshooting

### Payment Stuck in "Processing"

1. Check backend logs
2. Verify database connection
3. Check Razorpay API status
4. Retry payment

### Order Not Created After Payment

1. Check payment verification logs
2. Verify signature validation
3. Check database for errors
4. Review backend logs

### Signature Mismatch

1. Verify RAZORPAY_KEY_SECRET is correct
2. Check order ID and payment ID
3. Verify signature format
4. Check for encoding issues

## Support

For issues:
1. Check console logs
2. Review backend logs
3. Check database records
4. Contact Razorpay support

