"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/components/Toast";

interface StockAlertButtonProps {
  productId: string;
}

export default function StockAlertButton({ productId }: StockAlertButtonProps) {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const alerts: string[] = JSON.parse(localStorage.getItem("stockAlerts") || "[]");
    if (alerts.includes(productId)) setSubscribed(true);
  }, [productId]);

  const subscribe = () => {
    const alerts: string[] = JSON.parse(localStorage.getItem("stockAlerts") || "[]");
    if (!alerts.includes(productId)) {
      alerts.push(productId);
      localStorage.setItem("stockAlerts", JSON.stringify(alerts));
    }
    setSubscribed(true);
    showToast("Вы подписались на уведомление о поступлении");
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Вы подписаны на уведомление
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      Сообщить о поступлении
    </button>
  );
}
