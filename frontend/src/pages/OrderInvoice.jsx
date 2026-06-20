import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../utils/axios';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export default function OrderInvoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error loading invoice details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12">
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-500">Invoice not found or unauthorized view</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-lg">Return Home</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans p-6 md:p-12 max-w-4xl mx-auto relative">
      
      {/* Control Actions - Hidden during Print */}
      <div className="print:hidden flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Order
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF Invoice
        </button>
      </div>

      {/* Invoice Layout Sheet */}
      <div className="space-y-8 p-4 md:p-8 border border-slate-200 rounded-xl relative overflow-hidden">
        
        {/* Payment stamp watermark overlay */}
        <div className="absolute right-8 top-16 transform rotate-12 opacity-15 border-4 border-emerald-500 text-emerald-500 px-6 py-2 rounded-lg text-2xl font-black uppercase tracking-widest pointer-events-none select-none">
          {order.isPaid ? 'PAID IN FULL' : 'CASH ON DELIVERY'}
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              <span className="text-accent">Shop</span>Sphere
            </h1>
            <p className="text-xs text-slate-400 mt-1">Receipt & Purchase Breakdown</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-extrabold uppercase text-slate-650 tracking-wider">INVOICE</h2>
            <p className="text-xs font-bold text-slate-700 mt-1">Invoice ID: #{order._id}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Issued: {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Billed info blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Billed Customer</h4>
            <p className="font-bold text-slate-800">{order.user?.name}</p>
            <p className="mt-0.5">{order.user?.email}</p>
            <p className="mt-0.5">Phone: {order.phone}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Shipment Destination</h4>
            <p className="font-bold text-slate-800">{order.user?.name}</p>
            <p className="mt-0.5">{order.shippingAddress?.street}</p>
            <p className="mt-0.5">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
            </p>
            <p className="mt-0.5">{order.shippingAddress?.country}</p>
          </div>
        </div>

        {/* Products Table */}
        <table className="w-full text-xs text-left mt-8 border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-800 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Item details</th>
              <th className="py-3 px-4 text-center">Unit Price</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {order.orderedProducts?.map((item) => (
              <tr key={item._id || item.product}>
                <td className="py-4 px-4 font-semibold text-slate-950 max-w-sm truncate">{item.name}</td>
                <td className="py-4 px-4 text-center font-medium">${item.price?.toFixed(2)}</td>
                <td className="py-4 px-4 text-center font-medium">{item.quantity}</td>
                <td className="py-4 px-4 text-right font-bold text-slate-950">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Summary Block */}
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2.5 text-xs text-slate-600 text-right pr-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${(order.totalAmount - order.taxPrice - order.shippingPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax (8%)</span>
              <span className="font-semibold text-slate-800">${order.taxPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Logistics</span>
              <span className="font-semibold text-slate-800">${order.shippingPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-250 pt-3 text-sm font-black text-slate-950">
              <span>Grand Total</span>
              <span className="text-accent">${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment breakdown / status */}
        <div className="border-t border-slate-150 pt-8 text-center text-[10px] text-slate-400 space-y-2">
          <p>Payment Mode chosen: <span className="font-semibold text-slate-600 uppercase">{order.paymentMethod}</span></p>
          <p>For support questions relating to returns, email support@shopsphere.com referencing your order ID.</p>
          <p className="font-semibold">Thank you for business with ShopSphere!</p>
        </div>

      </div>

    </div>
  );
}
