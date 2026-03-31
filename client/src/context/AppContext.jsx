import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { dummyProducts } from "../assets/assets";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY;

  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔑 VERY IMPORTANT FLAG
  const isInitialLoad = useRef(true);

  // ================= SELLER AUTH =================
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(!!data.success);
    } catch {
      setIsSeller(false);
    }
  };

  // ================= USER AUTH =================
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");

      if (data.success && data.user) {
        const safeCart =
          data.user.cartItems &&
            typeof data.user.cartItems === "object" &&
            !Array.isArray(data.user.cartItems)
            ? data.user.cartItems
            : {};

        setUser(data.user);
        setCartItems(safeCart);
      } else {
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      setUser(null);
      setCartItems({});
    }
  };

  // ================= PRODUCTS =================
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success && data.products && data.products.length > 0) {
        setProducts(data.products);
      } else {
        setProducts(dummyProducts);
      }
    } catch (error) {
      setProducts(dummyProducts);
    }
  };

  // ================= CART =================
  const addToCart = (itemId) => {
    setCartItems(prev => {
      const cart = structuredClone(prev);
      cart[itemId] = (cart[itemId] || 0) + 1;
      return cart;
    });
    toast.success("Added to Cart");
  };

  const updateCartItem = (itemId, quantity) => {
    setCartItems(prev => {
      const cart = structuredClone(prev);
      cart[itemId] = quantity;
      return cart;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      const cart = structuredClone(prev);
      if (cart[itemId]) {
        cart[itemId]--;
        if (cart[itemId] === 0) delete cart[itemId];
      }
      return cart;
    });
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((a, b) => a + b, 0);

  const getCartAmount = () => {
    let total = 0;

    if (!products || !Array.isArray(products) || products.length === 0) return 0;
    if (!cartItems || typeof cartItems !== 'object' || Object.keys(cartItems).length === 0) return 0;

    try {
      Object.entries(cartItems).forEach(([id, qty]) => {
        if (!id || !qty) return;
        
        const item = products.find((p) => p && p._id === id);

        if (item && typeof item.offerPrice === 'number' && qty > 0) {
          total += item.offerPrice * qty;
        }
      });
    } catch (error) {
      console.error('Error calculating cart amount:', error);
      return 0;
    }

    return Math.round(total * 100) / 100;
  };


  // ================= INITIAL LOAD =================
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchProducts(),
        fetchSeller(),
        fetchUser()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // ================= CART SYNC (FIXED) =================
  useEffect(() => {
    // ❌ skip first render (page refresh)
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // ❌ skip if not logged in
    if (!user) return;

    const updateCart = async () => {
      try {
        await axios.post("/api/cart/update", { cartItems });
      } catch {
        console.log("Cart sync failed");
      }
    };

    updateCart();
  }, [cartItems, user]);

  const value = useMemo(() => ({
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItems,
    searchQuery,
    setSearchQuery,
    getCartCount,
    getCartAmount,
    axios,
    fetchProducts,
    setCartItems
  }), [user, isSeller, showUserLogin, products, cartItems, searchQuery]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
