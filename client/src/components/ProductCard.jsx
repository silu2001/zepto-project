import React from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const ProductCard = ({ product }) => {
  const {
    currency,
    addToCart,
    removeFromCart,
    cartItems,
    navigate
  } = useAppContext()

  if (!product) return null

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category.toLowerCase()}/${product._id}`)
        window.scrollTo(0, 0)
      }}
      className="
        border border-gray-500/20
        rounded-lg
        bg-white
        p-3 md:p-4
        w-full
        hover:shadow-md
        transition
        cursor-pointer
      "
    >
      {/* Image */}
      <div className="group flex items-center justify-center mb-3">
        <img
          src={product.image[0]}
          alt={product.name}
          className="
            w-24 h-24
            sm:w-28 sm:h-28
            md:w-32 md:h-32
            object-contain
            transition-transform
            group-hover:scale-105
          "
        />
      </div>

      {/* Content */}
      <div className="text-gray-500/70 text-sm">
        <p className="capitalize">{product.category}</p>

        <p className="text-gray-800 font-medium text-sm md:text-base truncate">
          {product.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mt-1">
          {Array(5)
            .fill('')
            .map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt=""
                className="w-3 md:w-3.5"
              />
            ))}
          <p className="text-xs md:text-sm">(4)</p>
        </div>

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-3 gap-2">
          <p className="text-[#4fbf8b] font-medium text-base md:text-lg">
            {currency}{product.offerPrice}
            <span className="text-gray-400 text-xs md:text-sm line-through ml-1">
              {currency}{product.price}
            </span>
          </p>

          <div onClick={(e) => e.stopPropagation()}>
            {!cartItems[product._id] ? (
              <button
                onClick={() => addToCart(product._id)}
                className="
                  flex items-center gap-1
                  bg-[#4fbf8b]/10
                  border border-[#4fbf8b]/40
                  px-3 py-1.5
                  rounded
                  text-sm
                  font-medium
                  hover:bg-[#4fbf8b]/20
                  transition
                "
              >
                <img src={assets.cart_icon} alt="cart" className="w-4" />
                Add
              </button>
            ) : (
              <div
                className="
                  flex items-center
                  bg-[#4fbf8b]/25
                  rounded
                  h-8
                  select-none
                "
              >
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="px-2 text-lg"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="px-2 text-lg"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
