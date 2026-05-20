import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount = 900, userEmail } = body; // 900 paise = ₹9.00

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    const isRazorpayConfigured = 
      keyId && 
      keySecret && 
      !keyId.includes('your_key_id') && 
      !keySecret.includes('your_razorpay_secret');

    if (!isRazorpayConfigured) {
      // Mock order generation for local sandboxed testing
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      return NextResponse.json({
        id: mockOrderId,
        amount,
        currency: 'INR',
        receipt: 'counsel_payment_receipt',
        isMock: true,
        key: 'rzp_test_mock_key_id'
      });
    }

    // Official Razorpay API order creation
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `counsel_receipt_${Date.now()}`
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Razorpay Order creation failed: ${errText}`);
    }

    const orderData = await response.json();
    return NextResponse.json({
      ...orderData,
      isMock: false,
      key: keyId
    });

  } catch (error: any) {
    console.error('Error creating Razorpay Order:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
