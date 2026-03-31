import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
  const {
    products,
    cartItems,
    removeFromCart,
    updateCartItem,
    getCartCount,
    currency,
    navigate,
    getCartAmount,
    axios,
    user,
    setCartItems,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");

  /* ================= BUILD CART ================= */
  useEffect(() => {
    if (!products?.length || !cartItems || !Object.keys(cartItems).length) {
      setCartArray([]);
      return;
    }

    const temp = Object.keys(cartItems)
      .map((id) => {
        const product = products.find((p) => p?._id === id);
        return product ? { ...product, quantity: cartItems[id] } : null;
      })
      .filter(Boolean);

    setCartArray(temp);
  }, [products, cartItems]);

  /* ================= GET ADDRESS ================= */
  const getUserAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddresses(data.addresses || []);
        setSelectedAddress(data.addresses?.[0] || null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) getUserAddress();
  }, [user]);

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!cartArray.length) return toast.error("Your cart is empty");
    if (!selectedAddress) return toast.error("Please select an address");

    try {
      const payload = {
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
      };

      /* -------- COD ORDER -------- */
      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", payload);

        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      }

      /* -------- STRIPE ORDER -------- */
      else {
        const { data } = await axios.post("/api/order/stripe", payload);

        if (data.success && data.session_url) {
          window.location.href = data.session_url; // ✅ FIX
        } else {
          toast.error(data.message || "Stripe session failed");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!products?.length) return null;

  const tax = Math.round(getCartAmount() * 0.02);
  const totalAmount = getCartAmount() + tax;

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto">
      {/* ================= LEFT ================= */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-[#4fbf8b]">
            ({getCartCount()})
          </span>
        </h1>

        {cartArray.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-[2fr_1fr_1fr] items-center pt-4"
          >
            <div className="flex gap-4">
              <img
                src={item.image?.[0]}
                alt={item.name}
                className="w-24 h-24 border object-cover cursor-pointer"
                onClick={() =>
                  navigate(`/products/${item.category}/${item._id}`)
                }
              />

              <div>
                <p className="font-semibold">{item.name}</p>

                <select
                  value={cartItems[item._id]}
                  onChange={(e) =>
                    updateCartItem(item._id, Number(e.target.value))
                  }
                  className="border mt-1"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-center">
              {currency}
              {item.offerPrice * item.quantity}
            </p>

            <button onClick={() => removeFromCart(item._id)}>
              <img src={assets.remove_icon} className="w-6" />
            </button>
          </div>
        ))}
      </div>

      {/* ================= RIGHT ================= */}
      <div className="max-w-90 w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        {/* ADDRESS */}
        <p className="text-sm font-medium uppercase">Delivery Address</p>
        <div className="relative flex justify-between items-start mt-2">
          <p className="text-gray-500">
            {selectedAddress
              ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}`
              : "No address found"}
          </p>
          <button
            onClick={() => setShowAddress(!showAddress)}
            className="text-[#4fbf8b] hover:underline"
          >
            Change
          </button>

          {showAddress && (
            <div className="absolute top-12 bg-white border w-full z-10">
              {addresses.map((addr) => (
                <p
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddress(false);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {addr.street}, {addr.city}
                </p>
              ))}
              <p
                onClick={() => navigate("/add-address")}
                className="text-[#4fbf8b] text-center cursor-pointer p-2 hover:bg-indigo-500/10"
              >
                + Add address
              </p>
            </div>
          )}
        </div>

        {/* PAYMENT */}
        <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
        <select
          value={paymentOption}
          onChange={(e) => setPaymentOption(e.target.value)}
          className="w-full border px-3 py-2 mt-2"
        >
          <option value="COD">Cash On Delivery</option>
          <option value="Online">Online Payment</option>
        </select>

        <hr className="border-gray-300 my-5" />

        {/* PRICE */}
        <div className="text-gray-600 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{currency}{getCartAmount()}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>{currency}{tax}</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total</span>
            <span>{currency}{totalAmount}</span>
          </p>
        </div>

        <button
          disabled={!cartArray.length}
          onClick={placeOrder}
          className="w-full py-3 mt-6 bg-[#4fbf8b] text-white font-medium disabled:opacity-50 hover:bg-indigo-600"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
