import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import ProductCard from './ProductCard'

const AllProducts = () => {
  const { products, searchQuery } = useAppContext()
  const [filteredProducts, setFilteredProducts] = useState([])

  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([])
      return
    }

    if (searchQuery && searchQuery.length > 0) {
      setFilteredProducts(
        products.filter(product =>
          product && product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    } else {
      setFilteredProducts(products)
    }
  }, [products, searchQuery])

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max mb-6">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-16 h-0.5 bg-[#4fbf8b] rounded-full"></div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredProducts
          .filter(product => product.inStock)
          .map((product, index) => (
            <ProductCard key={product._id || index} product={product} />
          ))}
      </div>
    </div>
  )
}

export default AllProducts
