import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets, dummyOrders } from '../../assets/assets'
import axios from 'axios'
import toast from 'react-hot-toast'

const Orders = () => {
    const { currency ,axios } = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () => {
      try {
        const {data} = await axios.get('/api/order/seller');
        if(data.success){
            setOrders(data.orders)
        }else{
            toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col">
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Orders List</h2>

                {orders.map((order, index) => (
                    <div
                        key={index}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 max-w-4xl rounded-md border border-gray-300"
                    >
                        {/* Products */}
                        <div className="flex gap-5 max-w-80">
                            <img
                                className="w-12 h-12 object-cover"
                                src={assets.box_icon}
                                alt="box"
                            />
                            <div>
                                {order.items?.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <p key={index} className="font-medium">
                                            {item.product.name}
                                            <span className="text-[#4fbf8b]"> x {item.quantity}</span>
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No items</p>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="text-sm md:text-base text-black/60">
                            <p className="text-black/80">
                                {order.address.firstName} {order.address.lastName}
                            </p>
                            <p>
                                {order.address.street}, {order.address.city}
                            </p>
                            <p>
                                {order.address.state}, {order.address.zipcode},{' '}
                                {order.address.country}
                            </p>
                            <p>{order.address.phone}</p>
                        </div>

                        {/* Amount */}
                        <p className="font-medium text-lg">
                            {currency}{order.amount}
                        </p>

                        {/* Order Info */}
                        <div className="flex flex-col text-sm md:text-base text-black/60">
                            <p>Method: {order.paymentType}</p>
                            <p>
                                Date:{' '}
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                                Payment: {order.isPaid ? 'Paid' : 'Pending'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders
