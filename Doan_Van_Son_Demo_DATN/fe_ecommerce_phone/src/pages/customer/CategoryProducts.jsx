import { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import apiCategory from "../../api/apiCategory";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check } from "lucide-react";
import AppContext from "../../context/AppContext";
import ProductCard from "../../components/product/ProductCard";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const CategoryProducts = () => {
    const { id } = useParams();
    const { setCartCounter, theme } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [processedProducts, setProcessedProducts] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Hàm kiểm tra và xử lý giá giảm
    const processProducts = useCallback((products) => {
        const now = new Date();
        return products.map(product => {
            const discountValid = product.discountExpiresAt
                ? new Date(product.discountExpiresAt) > now
                : false;

            const shouldShowDiscount = discountValid &&
                product.discountedPrice &&
                product.discountedPrice < product.sellingPrice;

            return {
                ...product,
                finalPrice: shouldShowDiscount ? product.discountedPrice : product.sellingPrice,
                isDiscountActive: shouldShowDiscount
            };
        });
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const categories = await apiCategory.getAllCategories();
            const category = categories.find((cat) => cat.id === parseInt(id));
            setCategoryName(category?.name || "Danh mục không xác định");

            const productsData = await apiCategory.getProductsByCategoryId(id, { cacheBust: Date.now() });
            const formattedProducts = Array.isArray(productsData) ? productsData : [];

            setProducts(formattedProducts);
            setProcessedProducts(processProducts(formattedProducts));
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Không thể tải sản phẩm, vui lòng thử lại!", { autoClose: 2000 });
        } finally {
            setLoading(false);
        }
    }, [id, processProducts]);

    useEffect(() => {
        fetchData();
    }, [id, refreshKey, fetchData]);

    // Kiểm tra giá giảm mỗi phút
    useEffect(() => {
        const checkDiscountInterval = setInterval(() => {
            setProcessedProducts(processProducts(products));
        }, 60 * 1000); // 1 phút

        return () => clearInterval(checkDiscountInterval);
    }, [products, processProducts]);

    // Làm mới dữ liệu mỗi 5 phút
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            setRefreshKey(prev => prev + 1);
        }, 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, []);

    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
    }, []);

    const handleAddToCart = useCallback((product) => {
        toast(
            <div className="flex items-center w-full p-2 bg-gray-900 border-2 border-[#00ffcc] rounded-lg shadow-[0_0_10px_#00ffcc]">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <ShoppingCart className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-white">
                    {`${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`}
                </span>
            </div>,
            {
                autoClose: 1500,
                position: "top-center",
                hideProgressBar: true,
                className: "toast-custom",
            }
        );

        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = existingCart.find((item) => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            existingCart.push({
                id: product.id,
                quantity: 1,
                name: product.name || "Sản phẩm không tên",
                price: product.finalPrice,
                images: product.images || [],
            });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
        const totalItems = existingCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCounter(totalItems);
    }, [setCartCounter]);

    const handleBuyNow = useCallback((product) => {
        handleAddToCart(product);
        setTimeout(() => (window.location.href = "/cart"), 1600);
    }, [handleAddToCart]);

    if (loading) return <div className={`text-center py-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Đang tải...</div>;

    return (
        <div className={`p-4 sm:p-6 ${theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"} font-lato min-h-screen`}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Sản phẩm hãng: {categoryName}
            </h1>
            {processedProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {processedProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                            handleBuyNow={handleBuyNow}
                            formatPrice={formatPrice}
                            showDiscount={product.isDiscountActive}
                        />
                    ))}
                </div>
            ) : (
                <p className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {loading ? "Đang tải..." : "Không có sản phẩm nào trong danh mục này."}
                </p>
            )}
            <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar
                theme={theme === "dark" ? "dark" : "light"}
                className="text-xs sm:text-sm md:text-base"
            />
        </div>
    );
};

export default CategoryProducts;