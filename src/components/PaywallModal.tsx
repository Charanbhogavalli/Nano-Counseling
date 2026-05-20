'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, X, CreditCard, Lock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { dbService } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showMockConsole, setShowMockConsole] = useState(false);
  const [mockOrderId, setMockOrderId] = useState('');

  if (!isOpen) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const user = await dbService.getCurrentUser();
      
      // 1. Create order on the server
      const res = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 900, userEmail: user.email })
      });

      if (!res.ok) throw new Error('Order creation failed.');
      const orderData = await res.json();

      // 2. Check if order is a local mock order
      if (orderData.isMock) {
        setMockOrderId(orderData.id);
        setShowMockConsole(true);
        setLoading(false);
        return;
      }

      // 3. Load script for live Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateways. Check connection.');
        setLoading(false);
        return;
      }

      // 4. Configure options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Nano Counseling',
        description: 'Unlock all engineering college predictions',
        order_id: orderData.id,
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail: user.email,
                userId: user.id,
                isMock: false
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              triggerSuccessEffects();
            } else {
              alert('Payment verification failed: ' + verifyData.error);
            }
          } catch (err) {
            console.error(err);
            alert('Verification network issue.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          email: user.email,
          name: user.full_name
        },
        theme: {
          color: '#a12cff'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      
    } catch (err: any) {
      console.error(err);
      alert('Error initiating checkout: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockSuccess = async () => {
    setLoading(true);
    try {
      const user = await dbService.getCurrentUser();
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          userEmail: user.email,
          userId: user.id,
          isMock: true
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        triggerSuccessEffects();
      } else {
        alert('Mock signature reject.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccessEffects = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00d2ff', '#a12cff', '#ff007f', '#00ff87']
    });
    
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Paywall Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-brand-dark/95 shadow-2xl">
        
        {/* Glow Header */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {!showMockConsole ? (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple shadow-[0_0_15px_rgba(161,44,255,0.15)]">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mt-2">Unlock Predictive Authority</h3>
              <p className="text-sm text-slate-400">
                Get full access to mock cutoffs, best preference sorting and college charts.
              </p>
            </div>

            {/* Price tag */}
            <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-2xl border border-white/5 glow-card-purple">
              <span className="text-xs font-semibold uppercase tracking-widest text-neon-pink">One-Time Fee</span>
              <div className="flex items-baseline mt-1 space-x-1">
                <span className="text-4xl font-extrabold text-white">₹9</span>
                <span className="text-xs text-slate-400">only</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Secure payment via Razorpay. Valid for all counseling systems.</p>
            </div>

            {/* Features list */}
            <ul className="space-y-3.5 text-sm text-slate-300">
              <li className="flex items-center space-x-3">
                <CheckCircle2 size={16} className="text-neon-blue" />
                <span>Reveal <strong>all matching colleges</strong> (currently limited to top 3)</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 size={16} className="text-neon-blue" />
                <span>Generate **Best Counseling Preference Sequence Order**</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 size={16} className="text-neon-blue" />
                <span>View historical cutoff data (COMEDK, KCET, EAMCET, JEE)</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle2 size={16} className="text-neon-blue" />
                <span>Active for all engineering rounds of 2026</span>
              </li>
            </ul>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={handlePayment}
                isLoading={loading}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                <CreditCard size={16} className="mr-2" />
                Unlock predictor now (₹9)
              </Button>
              
              <div className="flex items-center justify-center space-x-2 mt-4 text-slate-500 text-xs">
                <ShieldCheck size={14} className="text-neon-green" />
                <span>SSL Encrypted. Razorpay Authorized Gateway.</span>
              </div>
            </div>
          </div>
        ) : (
          /* Mock Payment Sim Console */
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-pink/10 border border-neon-pink/20 text-neon-pink shadow-[0_0_15px_rgba(255,0,127,0.15)]">
                <Lock size={20} className="animate-bounce" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mt-2">Sandbox Payment Gateways</h3>
              <p className="text-xs text-slate-400">
                You are running the application using default credentials. We have triggered our custom transaction simulation.
              </p>
            </div>

            <div className="font-mono text-xs bg-slate-950/80 p-4 rounded-xl border border-white/5 space-y-1 text-slate-400 max-h-[140px] overflow-y-auto">
              <p className="text-neon-blue">[sys] Initializing Payment Gateway Wrapper...</p>
              <p className="text-slate-400">[sys] Method: Razorpay Custom Simulation</p>
              <p className="text-slate-400">[sys] Amount: ₹9.00 INR</p>
              <p className="text-neon-pink">[sys] Order ID: {mockOrderId}</p>
              <p className="text-slate-500">[sys] Waiting for student response...</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                variant="glow"
                onClick={handleMockSuccess}
                isLoading={loading}
                className="w-full justify-center text-xs font-semibold py-2.5"
              >
                Approve Payment
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setShowMockConsole(false);
                  onClose();
                }}
                className="w-full justify-center text-xs font-semibold py-2.5 text-risky-red border-risky-red/20 hover:border-risky-red/50 hover:bg-risky-red/5 hover:text-risky-red"
              >
                Cancel / Reject
              </Button>
            </div>
            
            <p className="text-center text-[10px] text-slate-500">
              Approving mock payment sets <strong>is_premium = true</strong> locally and in user metadata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
