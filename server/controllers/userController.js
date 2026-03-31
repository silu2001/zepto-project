import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

// REGISTER USER : POST /api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Check JWT secret
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT secret not configured"
            });
        }

        // 3. Normalize email
        const normalizedEmail = email.toLowerCase();

        // 4. Check existing user
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        // 7. Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 8. Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 9. Response
        return res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                cartItems: {}
            }
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//Login user :/api/user/login

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.json({ success: false, message: 'Email and password are required' })

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch)
            return res.json({ success: false, message: 'Invalid email or password' })

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 8. Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 9. Response
        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                cartItems: user.cartItems || {}
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//Check auth user :/api/user/is-auth

// GET /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
            });
        }

        const cartItems = req.user.cartItems && typeof req.user.cartItems === "object" && !Array.isArray(req.user.cartItems) 
            ? req.user.cartItems 
            : {};

        return res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                cartItems: cartItems,
            },
        });
    } catch (error) {
        console.error("isAuth Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

//Logout user :/api/user/Logout

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}