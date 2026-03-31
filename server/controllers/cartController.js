import User from "../models/User.js"


//update User cart :/api/cart/update
export const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const userId = req.user._id;

        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { cartItems }, { new: true }).select("-password");

        res.json({ 
            success: true, 
            message: "Cart updated",
            user: updatedUser
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};