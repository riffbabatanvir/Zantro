# Bangla Translation Fix — Zantro

## What was fixed
All UI strings now properly translate when Bangla mode is selected.

## Files changed (13 files)

### `src/LanguageContext.tsx`
Added 55+ missing Bengali translations including:
- Buy Now, Complete Purchase, Processing...
- Checkout, View Full Cart, Shopping Cart, Your Selection
- Subtotal, Shipping, Total, Free, Summary
- All Products, No products found, Price Range, sort options
- Order Placed!, Thank you for your purchase, Your Order ID
- Pre-Order Notice, Back to Cart, Shipping Information
- And many more

### `src/components/CartDrawer.tsx`
Added `useLanguage` — was fully hardcoded English.

### `src/pages/Cart.tsx`
Added `useLanguage` — was fully hardcoded English.

### `src/pages/Checkout.tsx`
Added `useLanguage` — was fully hardcoded English.
Translates: Checkout, Complete Purchase, Processing, Subtotal,
Shipping, Total, Pay Now, Free, Order Summary, Apply, Back to Cart, etc.

### `src/pages/ProductDetail.tsx`
Added `useLanguage`.
Translates: Buy Now, Add to Cart, Update Cart,
Add Pre-order to Cart, Pre-Order & Checkout, Pre-Order & Buy.

### `src/pages/Shop.tsx`
Added `useLanguage`.
Translates: All Products, Everything, No products found,
Price Range, Apply, Clear, sort options, Showing results for.

### `src/pages/MyZantro.tsx`
Added `useLanguage`. Translates key labels and tab names.

### `src/pages/OrderTracking.tsx`
Added `useLanguage`. Translates page heading, Order ID placeholder, status labels.

### `src/pages/FAQ.tsx`
Added `useLanguage`. Translates page heading.

### `src/pages/About.tsx`
Added `useLanguage`. Translates About Us, Our Story, Our Mission.

### `src/pages/Contact.tsx`
Added `useLanguage`. Translates form labels and headings.

### `src/components/Hero.tsx`
Added `useLanguage`. Translates slide titles, subtitles, Shop Now button.

### `src/pages/PreOrder.tsx`
Added `useLanguage`. Translates Pre-Order badge, Update Cart, tier selector.

## How to apply
Drop these files into your project's `src/` directory, replacing the originals.
No other changes needed — all new translations are self-contained in `LanguageContext.tsx`.
