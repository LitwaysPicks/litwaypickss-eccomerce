import React from "react";
import { Truck, Shield, Heart, Users, Award, Globe } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: Truck,
      title: "Free Nationwide Delivery",
      description:
        "We deliver to every corner of Liberia at no extra cost to you.",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description:
        "Your personal information and payments are always protected.",
      gradient: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      icon: Heart,
      title: "Quality Products",
      description:
        "We carefully curate every product to ensure the highest quality.",
      gradient: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
    },
    {
      icon: Users,
      title: "24/7 Customer Support",
      description:
        "Our friendly team is always here to help via phone or WhatsApp.",
      gradient: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
    {
      icon: Award,
      title: "Trusted by Thousands",
      description: "Join thousands of satisfied customers across Liberia.",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-100",
    },
    {
      icon: Globe,
      title: "Local & International Brands",
      description:
        "Access to both local Liberian products and international brands.",
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
    },
  ];
  const team = [
    {
      name: "Moses J. Lamah",
      role: "Founder & CEO",
      description: `
Moses J. Lamah is the visionary founder and CEO of LitwayPicks. A passionate digital marketer and tech innovator, Moses is currently pursuing a degree in Computer Science at Marwadi University in India and holds a certification in Database Management Systems from INFOSYS.

With over five years of hands-on experience, he has collaborated with some of Liberia’s most recognized companies, including ORANGE Liberia, Lonestar Mobile Money, E-Wallie, TipMe, and The Gathering Group Worldwide. From 2022 to 2024, he also served as an IT consultant at the National Public Health Institute of Liberia (NPHIL).

Moses combines technical expertise with a deep understanding of digital strategy and customer-centric innovation. Under his leadership, LitwayPicks is driven by a bold mission: to reshape the e-commerce landscape across emerging markets—making online shopping more accessible, intuitive, and impactful for everyday users.
    `.trim(),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-100 to-orange-100 rounded-full px-6 py-2 mb-6">
          <span className="text-primary-600 font-semibold text-sm">
            🇱🇷 PROUDLY LIBERIAN
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About LitwayPicks
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We're Liberia's premier e-commerce platform, dedicated to bringing you
          the best products with unmatched convenience and service. From
          electronics to fashion, home goods to beauty products, we've got
          everything you need.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Founded in 2024, LitwayPicks born from a simple vision: to make
              quality products accessible to every Liberian, regardless of where
              they live. We recognized that many people in Liberia faced
              challenges accessing diverse, high-quality products at fair
              prices.
            </p>
            <p>
              Starting as a small team with big dreams, we are growing to become
              Liberia's most trusted first ever e-commerce platform. Our
              commitment to excellence, customer satisfaction, and community
              development has made us the go-to destination for online shopping
              in Liberia.
            </p>
            <p>
              Today, we serve customers in Liberia, offering free nationwide
              delivery and supporting local businesses while bringing
              international brands to our beautiful country.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="card-elevated overflow-hidden">
            <img
              src="https://images.pexels.com/photos/6214479/pexels-photo-6214479.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="LitwayPicks team"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="card-elevated p-8 text-center bg-gradient-to-br from-primary-50 to-orange-50 border-primary-200">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-700 leading-relaxed">
            To democratize access to quality products across Liberia by
            providing a seamless, reliable, and affordable e-commerce experience
            that connects customers with the products they need and love.
          </p>
        </div>
        <div className="card-elevated p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
          <p className="text-gray-700 leading-relaxed">
            To become West Africa's leading e-commerce platform, empowering
            businesses and consumers while contributing to the economic growth
            and digital transformation of Liberia.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose LitwayPicks?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card-elevated p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br ${feature.bgColor} border-0`}
            >
              <div
                className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg`}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          The Founder
        </h2>
        <div className="flex justify-center">
          {team.map((member, index) => (
            <div
              key={index}
              className="card-elevated p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 max-w-sm"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-primary-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {member.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="card-elevated bg-gradient-to-br from-primary-600 via-primary-700 to-orange-600 text-white p-8 mb-16 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">10,000+</div>
            <div className="text-primary-100">Happy Customers</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">5,000+</div>
            <div className="text-primary-100">Products</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">15</div>
            <div className="text-primary-100">Counties Served</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">99%</div>
            <div className="text-primary-100">Satisfaction Rate</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Start Shopping?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of satisfied customers and experience the LitwayPicks
          difference today.
        </p>
        <div className="space-x-4">
          <a
            href="/shop"
            className="btn btn-primary px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Start Shopping
          </a>
          <a
            href="/contact"
            className="btn btn-outline px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
