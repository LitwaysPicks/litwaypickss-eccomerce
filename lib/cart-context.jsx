"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from './supabase'

const CartContext = createContext()

const STORAGE_KEY = 'litwaypicks-cart'
const SYNC_DEBOUNCE_MS = 800

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [userId, setUserId] = useState(null)
  const syncTimer = useRef(null)
  // Set during the auth-merge setState to prevent the sync useEffect from
  // scheduling a redundant second save for the same data.
  const skipNextSyncRef = useRef(false)

  const loadFromSupabase = async (uid) => {
    const { data } = await supabase
      .from('carts')
      .select('items')
      .eq('user_id', uid)
      .single()
    return data?.items ?? null
  }

  const saveToSupabase = async (uid, cartItems) => {
    const { error } = await supabase
      .from('carts')
      .upsert({ user_id: uid, items: cartItems }, { onConflict: 'user_id' })
    if (error) toast.error('Cart sync failed — changes may not persist')
  }

  const scheduleSave = (uid, cartItems) => {
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => saveToSupabase(uid, cartItems), SYNC_DEBOUNCE_MS)
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch { /* corrupted — start empty */ }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)

      if (uid) {
        try {
          const remoteItems = await loadFromSupabase(uid)
          setItems(prev => {
            const merged = mergeCartItems(remoteItems ?? [], prev)
            skipNextSyncRef.current = true
            scheduleSave(uid, merged)
            return merged
          })
        } catch {
          // Keep local cart if sync fails
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }
    if (userId) scheduleSave(userId, items)
  }, [items, userId])

  const addItem = (product, qty = 1) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id)

      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error('Cannot add more — stock limit reached')
          return current
        }
        const newQty = Math.min(existing.quantity + qty, product.stock)
        toast.success('Item quantity updated')
        return current.map(item =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        )
      }

      const actualQty = Math.min(qty, product.stock)
      toast.success('Item added to cart')
      return [...current, { ...product, quantity: actualQty }]
    })
  }

  const removeItem = (id) => {
    setItems(current => current.filter(item => item.id !== id))
    toast.success('Item removed from cart')
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) { removeItem(id); return }
    setItems(current =>
      current.map(item => {
        if (item.id !== id) return item
        const newQuantity = Math.min(quantity, item.stock)
        if (newQuantity !== quantity) toast.error('Quantity limited by available stock')
        return { ...item, quantity: newQuantity }
      })
    )
  }

  const clearCart = () => {
    setItems([])
    toast.success('Cart cleared')
  }

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const total = items.reduce((sum, item) => {
    const price = item.sale_price ?? item.price
    return sum + price * item.quantity
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
  if (context === undefined) throw new Error('useCart must be used within a CartProvider')
  return context
}

function mergeCartItems(remote, local) {
  const remoteIds = new Set(remote.map(r => r.id))
  return [...remote, ...local.filter(l => !remoteIds.has(l.id))]
}
