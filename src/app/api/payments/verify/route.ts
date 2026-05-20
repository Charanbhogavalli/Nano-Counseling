import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbService } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
      userId,
      isMock = false
    } = body;

    if (!razorpay_order_id || !userEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required validation payload parameters.' },
        { status: 400 }
      );
    }

    let isSignatureValid = false;

    if (isMock || razorpay_order_id.startsWith('order_mock_')) {
      // Mock validation succeeds automatically
      isSignatureValid = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      
      if (!keySecret) {
        return NextResponse.json(
          { error: 'Server payment configuration is missing.' },
          { status: 500 }
        );
      }

      // Live Razorpay signature verification
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      isSignatureValid = generatedSignature === razorpay_signature;
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed. Transaction flagged.' },
        { status: 400 }
      );
    }

    // Record payment in the database and activate premium status
    const recordSuccess = await dbService.recordPayment({
      id: razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
      userId,
      amount: 900, // ₹9.00
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    if (!recordSuccess) {
      return NextResponse.json(
        { error: 'Payment verified, but database update failed.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and account upgraded to Premium successfully.'
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
