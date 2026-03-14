import React from 'react'
import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import Categories from '../components/home/Categories'
import Promotions from '../components/home/Promotions'
import Newsletter from '../components/home/Newsletter'
import RecentPurchases from '../components/home/RecentPurchases'

export default function HomePage() {
  return (
    <div className="space-y-16">
      <Hero />
      <div className="container mx-auto px-4">
        <FeaturedProducts />
        <Categories />
        <Promotions />
        <Newsletter />
      </div>
      <RecentPurchases />
    </div>
  )
}