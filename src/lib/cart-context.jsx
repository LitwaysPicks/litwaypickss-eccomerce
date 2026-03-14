import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('litwaypicks-cart')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('litwaypicks-cart', JSON.stringify(items))
  }, [items])

  const addItem = (product) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id)
      
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Cannot add more items - stock limit reached')
          return current
        }
        toast.success('Item quantity updated')
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        )
      }
      
      toast.success('Item added to cart')
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (id) => {
    setItems(current => current.filter(item => item.id !== id))
    toast.success('Item removed from cart')
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems(current =>
      current.map(item => {
        if (item.id === id) {
          const newQuantity = Math.min(quantity, item.stock)
          if (newQuantity !== quantity) {
            toast.error('Quantity limited by available stock')
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
    toast.success('Cart cleared')
  }

  const itemsCount = items.reduce((total, item) => total + item.quantity, 0)
  const total = items.reduce((total, item) => {
    const price = item.salePrice || item.price
    return total + (price * item.quantity)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}