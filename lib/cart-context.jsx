"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { track } from "@/lib/analytics"
import { toast } from 'sonner'
import { supabase } from './supabase'
import { buildCartItem, makeCartKey, normalizeCartItems } from './cart-contract'

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
    return data?.items ? normalizeCartItems(data.items) : null
  }

  const saveToSupabase = async (uid, cartItems) => {
    const { error } = await supabase
      .from('carts')
      .upsert({ user_id: uid, items: cartItems }, { onConflict: 'user_id' })
    if (error) toast.error("We couldn't save your cart to your account. Your items are still here on this device.")
  }

  const scheduleSave = (uid, cartItems) => {
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => saveToSupabase(uid, cartItems), SYNC_DEBOUNCE_MS)
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(normalizeCartItems(JSON.parse(saved)))
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

  // Variants (size, color) create distinct cart entries via a composite cartKey.
  const addItem = (product, qty = 1, variant = {}) => {
    track("add_to_cart", product?.id)
    const { size = null, color = null } = variant
    const cartKey = makeCartKey(product.id, size, color)

    setItems(current => {
      const existing = current.find(item => item.cartKey === cartKey)

      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error("You've already added all we have in stock.")
          return current
        }
        const newQty = Math.min(existing.quantity + qty, product.stock)
        toast.success('Item quantity updated')
        return current.map(item =>
          item.cartKey === cartKey ? { ...item, quantity: newQty } : item
        )
      }

      const actualQty = Math.min(qty, product.stock)
      toast.success('Item added to cart')
      return [...current, buildCartItem(product, { size, color, quantity: actualQty })]
    })
  }

  // cartKey is the composite key; falls back to id for legacy items without a key.
  const removeItem = (cartKey) => {
    setItems(current => current.filter(item => (item.cartKey ?? item.id) !== cartKey))
    toast.success('Item removed from cart')
  }

  const updateQuantity = (cartKey, quantity) => {
    if (quantity <= 0) { removeItem(cartKey); return }
    setItems(current =>
      current.map(item => {
        if ((item.cartKey ?? item.id) !== cartKey) return item
        const newQuantity = Math.min(quantity, item.stock)
        if (newQuantity !== quantity) toast.error("We only have that many in stock, so we've adjusted the quantity.")
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
  const remoteKeys = new Set(remote.map(r => r.cartKey ?? r.id))
  return [...remote, ...local.filter(l => !remoteKeys.has(l.cartKey ?? l.id))]
}
