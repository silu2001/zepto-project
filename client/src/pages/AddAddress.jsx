import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { useEffect } from 'react'

//input field Component
const InputField = ({ type, placeholder, name, handleChange, address }) => (
    <input type="text"
        placeholder={placeholder}
        onChange={handleChange}
        name={name}
        value={address[name]}
        required
        className='w-full border border-gray-500/30 px-4 py-2.5 rounded-md outline-none focus:border-[#4fbf8b]
         text-gray-500 transition'
    />
)

const AddAddress = () => {

    const { axios, user, navigate } = useAppContext()
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        Zipcode: '',
        country: '',
        phone: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value,

        }))
    }


    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/address/add', { address, userId: user._id })
            if (data.success) {
                toast.success(data.message)
                navigate('/cart')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(!user){
            navigate('/cart')
        }
    },[])
    return (
        <div className='mt-16 pb-16'>
            <p className='text-2xl md:text-3xl text-gray-500'>Add Shipping
                <span className='font-semibold text-[#4fbf8b]'> Address</span></p>

            <div className='flex flex-col-reverse md:flex-row justify-between mt-10'>
                <div className='flex-1 max-w-md'>
                    <form onSubmit={onSubmitHandler} className='space-y-3 mt-6 text-sm'>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address}
                                name='firstName' type='text' placeholder='First Name'
                            />

                            <InputField handleChange={handleChange} address={address}
                                name='lastName' type='text' placeholder='Last Name'
                            />

                        </div>
                        <InputField handleChange={handleChange} address={address}
                            name='email' type='email' placeholder='Email Address'
                        />
                        <InputField handleChange={handleChange} address={address}
                            name='street' type='text' placeholder='street Address'
                        />
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address}
                                name='city' type='text' placeholder='city'
                            />
                            <InputField handleChange={handleChange} address={address}
                                name='state' type='text' placeholder='State'
                            />
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField handleChange={handleChange} address={address}
                                name='zipcode' type='number' placeholder='Zipcode'
                            />
                            <InputField handleChange={handleChange} address={address}
                                name='country' type='text' placeholder='country'
                            />
                        </div>
                        <InputField handleChange={handleChange} address={address}
                            name='phone' type='number' placeholder='Phone Number'
                        />

                        <button className='w-full mt-6 bg-[#4fbf8b] text-white py-3 hover:bg-[#44ae7c] transition cursor-pointer uppercase'>Save address</button>

                    </form>

                </div>
                <img className='md:mr-16 mb-16 md:mt-0' src={assets.add_address_iamge} alt="add Address" />

            </div>

        </div>
    )
}

export default AddAddress
