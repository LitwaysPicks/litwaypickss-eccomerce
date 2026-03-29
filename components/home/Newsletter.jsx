"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      toast.success("Successfully subscribed to newsletter!");
      setEmail("");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="py-10 md:py-16">
      <div className="bg-primary-600 rounded-xl px-8 py-12 md:px-16 md:py-16">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Stay in the loop
          </h3>
          <p className="text-primary-100 text-base">
            Subscribe for new arrivals, exclusive deals, and special offers.
            Get 10% off your first order.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mt-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-md hover:bg-primary-50 transition-colors text-sm disabled:opacity-50 shrink-0"
            >
              {isLoading ? "Subscribing…" : "Subscribe"}
            </button>
          </form>

          <p className="text-xs text-primary-200">
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
