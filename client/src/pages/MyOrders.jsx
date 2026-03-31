import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      if (!user?._id) {
        setMyOrders([]);
        return;
      }

      const { data } = await axios.post("/api/order/user", { userId: user._id });
      if (data.success && Array.isArray(data.orders)) {
        setMyOrders(data.orders);
      } else {
        setMyOrders([]);
      }
    } catch (error) {
      console.log(error);
      setMyOrders([]);
    }
  };

  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user]);

  return (
    <div className="mt-16 pb-16">
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My Orders</p>
        <div className="w-16 h-0.5 bg-[#4fbf8b] rounded-full"></div>
      </div>

      {myOrders.map((order) => (
        <div
          key={order._id}
          className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl"
        >
          <p className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col">
            <span>Order ID : {order._id}</span>
            <span>Payment : {order.paymentType}</span>
            <span>
              Total Amount : {currency}
              {order.amount}
            </span>
          </p>

          {order.items?.map((item) => {
            const product = item?.product; // ✅ SAFE reference

            return (
              <div
                key={item._id}
                className="relative bg-white text-gray-500/70 border-b border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full max-w-4xl"
              >
                {/* PRODUCT INFO */}
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-[#4fbf8b]/10 rounded-lg p-4">
                    <img
                      src={product?.image?.[0] || "/placeholder.png"}
                      alt={product?.name || "Product"}
                      className="w-16 h-16 object-cover"
                    />
                  </div>

                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-800">
                      {product?.name || "Product removed"}
                    </h2>
                    <p>
                      Category : {product?.category || "N/A"}
                    </p>
                  </div>
                </div>

                {/* ORDER INFO */}
                <div className="flex flex-col justify-center md:ml-8 mb-4 md:mb-0">
                  <p>Quantity : {item.quantity || 1}</p>
                  <p>Status : {item.status}</p>
                  <p>
                    Date :{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* PRICE */}
                <p className="text-[#4fbf8b] text-lg font-medium">
                  Amount : {currency}
                  {(product?.offerPrice || 0) * (item.quantity || 1)}
                </p>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
