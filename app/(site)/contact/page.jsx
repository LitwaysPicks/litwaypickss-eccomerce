"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_EMAIL,
  CONTACT_PHONE_HREF,
  CONTACT_WHATSAPP_HREF,
  CONTACT_EMAIL_HREF,
} from "@/lib/contact";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message.");
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: CONTACT_PHONE_DISPLAY,
      href: CONTACT_PHONE_HREF,
      description: "Call us Monday to Friday, 8AM - 6PM",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: CONTACT_PHONE_DISPLAY,
      href: CONTACT_WHATSAPP_HREF,
      external: true,
      description: "Message us anytime for quick support",
    },
    {
      icon: Mail,
      title: "Email",
      details: CONTACT_EMAIL,
      href: CONTACT_EMAIL_HREF,
      description: "We typically respond within 24 hours",
    },
    {
      icon: MapPin,
      title: "Address",
      details: "Monrovia, Liberia",
    },
  ];

  const faqs = [
    {
      question: "How long does delivery take?",
      answer:
        "We deliver nationwide. Montserrado orders arrive within 24 hours; all other counties take 2–7 business days.",
    },
    {
      question: "Is delivery really free?",
      answer:
        "Yes! We offer completely free delivery to all 15 counties in Liberia. No minimum order required.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Mobile Money ( MTN MoMo), Cash on Delivery, and bank transfers.",
    },
    {
      question: "Can I return or exchange items?",
      answer:
        "Yes — returns are accepted within 48 hours of delivery for unused items in their original condition. A 10% deduction applies to eligible refunds.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions? We&apos;re here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {contactInfo.map((info, index) => (
          <div
            key={index}
            className="card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <div className="bg-primary-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <info.icon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {info.title}
            </h3>
            {info.href ? (
              <a
                href={info.href}
                {...(info.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="block font-medium text-primary-600 mb-1 hover:underline break-words"
              >
                {info.details}
              </a>
            ) : (
              <p className="font-medium text-primary-600 mb-1">{info.details}</p>
            )}
            <p className="text-sm text-gray-600">{info.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send us a Message
          </h2>
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <select
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Select a subject</option>
                <option value="order-inquiry">Order Inquiry</option>
                <option value="product-question">Product Question</option>
                <option value="delivery-issue">Delivery Issue</option>
                <option value="return-exchange">Return/Exchange</option>
                <option value="technical-support">Technical Support</option>
                <option value="partnership">Partnership Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                className="input resize-none"
                placeholder="Tell us how we can help you..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 card p-8 bg-gray-50">
        <div className="text-center">
          <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Business Hours
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div>
              <p className="font-medium text-gray-900">Monday - Friday</p>
              <p className="text-gray-600">8:00 AM - 6:00 PM</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Saturday - Sunday</p>
              <p className="text-gray-600">9:00 AM - 4:00 PM</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <a
              href={CONTACT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              WhatsApp support
            </a>{" "}
            available 24/7 for urgent inquiries
          </p>
        </div>
      </div>
    </div>
  );
}
