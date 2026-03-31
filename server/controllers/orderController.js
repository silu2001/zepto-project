import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from "stripe";
import User from '../models/User.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// helper
const calculateAmount = async (items) => {
  let amount = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.product}`);
    }
    amount += product.offerPrice * item.quantity;
  }

  // 2% tax
  amount += Math.floor(amount * 0.02);
  return amount;
};

/* =======================
   PLACE ORDER (COD)
======================= */
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ secure
    const { items, address } = req.body;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    const amount = await calculateAmount(items);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
      isPaid: false,
    });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//stripe to verify payment action : /stripe
export const stripeWebhooks = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    Response.status(400).send(`Webhook Error: $(error.message)`)
  }

  //Handel the event
  switch (event.type) {
    case "Payment_intent.succeeded":{
      const paymentIntent = event.data.object;
      const paymentIntentId = event.data.id;

      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId,
      });
      const {orderId , userId} = session.data[0].metadata;
      //Mark payment as paid
      await Order.findByIdAndUpdate(orderId,{isPaid:true})

      //clear the cart data
      await UserActivation.findByIdAndUpdate(userId,{cartItems:{}});
      break;
    }
    case "payment_intent.succeeded" :{
      const paymentIntent = event.data.object;
      const paymentIntentId = event.data.id;

      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId,
      });
      const {orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
  
    default:
      console.error(`unhandled event type ${event.type}`)
      break;
  }
  Response.json({received:true})
}

/* =======================
   GET USER ORDERS
======================= */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ secure

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   PLACE ORDER (STRIPE)
======================= */
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, address } = req.body;
    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    const line_items = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      line_items.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
          },
          unit_amount: product.offerPrice * 100, // Stripe uses paise
        },
        quantity: item.quantity,
      });
    }

    const amount = await calculateAmount(items);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

/* =======================
   GET ALL ORDERS (ADMIN)
======================= */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 }); // ✅ fixed typo

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
