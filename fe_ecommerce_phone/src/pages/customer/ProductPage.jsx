import React, { useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check } from "lucide-react";
import apiProduct from "../../api/apiProduct";
import AppContext from "../../context/AppContext";
import ProductCard from "../../components/product/ProductCard";
import ProductControls from "../../components/product/ProductControls";
import "react-lazy-load-image-component/src/effects/blur.css";
import "animate.css/animate.min.css";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
};

function ProductPage() {
    const { addToCart, cartItems, setCartCounter } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // For filtering
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [filterParams, setFilterParams] = useState({ priceRange: { minValue: null, maxValue: null } });
    const [sortCriteria, setSortCriteria] = useState("");

    useEffect(() => {
        fetchProductData(currentPage);
    }, [currentPage]);

    useEffect(() => {
        applyFiltersAndSort();
    }, [filterParams, sortCriteria, allProducts]);

    const fetchProductData = async (pageNumber = 0) => {
        setIsLoading(true);
        setError(null);
        try {
            // Ensure pageNumber is a valid number
            const validPage = Number(pageNumber) || 0;
            console.log("Fetching products for page:", validPage);

            // Fetch more products for better filtering
            const response = await apiProduct.getAllProducts("", validPage, 50);
            const productsData = response.content || [];
            setAllProducts(productsData);
            setProducts(productsData);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);

            // Check if it's a network/CORS error
            if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
                setError("Không thể kết nối đến server. Vui lòng kiểm tra xem backend đã được khởi động chưa.");
            } else if (error.message.includes("CORS")) {
                setError("Lỗi CORS: Backend chưa được cấu hình đúng hoặc chưa khởi động.");
            } else {
                setError(error.message || "Đã xảy ra lỗi không xác định");
            }

            toast.error("Không thể tải danh sách sản phẩm!", { autoClose: 3000 });
        } finally {
            setIsLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filteredProducts = [...allProducts];

        // Apply price filter
        if (filterParams.priceRange.minValue || filterParams.priceRange.maxValue) {
            filteredProducts = filteredProducts.filter(product => {
                const price = product.discountedPrice || product.sellingPrice || 0;
                const minPrice = filterParams.priceRange.minValue || 0;
                const maxPrice = filterParams.priceRange.maxValue || Infinity;
                return price >= minPrice && price <= maxPrice;
            });
        }

        // Apply sorting
        if (sortCriteria) {
            filteredProducts.sort((a, b) => {
                const priceA = a.discountedPrice || a.sellingPrice || 0;
                const priceB = b.discountedPrice || b.sellingPrice || 0;

                switch (sortCriteria) {
                    case "priceAsc":
                        return priceA - priceB;
                    case "priceDesc":
                        return priceB - priceA;
                    case "newest":
                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                    case "bestselling":
                        return (b.soldQuantity || 0) - (a.soldQuantity || 0);
                    default:
                        return 0;
                }
            });
        }

        setProducts(filteredProducts);
    };

    const handleAddToCart = (product) => {
        toast.success(
            `${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`,
            {
                icon: <ShoppingCart className="text-green-500" size={18} />,
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                containerId: "product-toast",
                toastClassName: "!text-sm !rounded-lg !shadow-lg !bg-gray-900 !text-white border border-[#00ffcc] px-4 py-3 !z-[1050] !shadow-[0_0_10px_#00ffcc] !transition-all !duration-300",
            }
        );

        addToCart({
            id: product.id,
            name: product.name || "Sản phẩm không tên",
            price: product.discountedPrice || product.sellingPrice || 0,
            quantity: 1,
            images: product.images || [],
        });

        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCounter(totalItems);
    };

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-400 text-lg animate__animated animate__pulse">
                    Đang tải danh sách sản phẩm...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-white to-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tải sản phẩm</h2>
                    <p className="text-red-600 text-lg mb-2">{error}</p>
                    <div className="text-gray-600 mb-6 space-y-2">
                        {error.includes("Network Error") || error.includes("CORS") ? (
                            <div>
                                <p className="mb-3">Backend server chưa được khởi động hoặc không thể kết nối.</p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                                    <p className="font-semibold text-blue-800 mb-2">🔧 Hướng dẫn khắc phục:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                        <li>Chạy file <code className="bg-blue-100 px-1 rounded">start-backend.bat</code> để khởi động backend</li>
                                        <li>Đợi backend khởi động hoàn tất (khoảng 30-60 giây)</li>
                                        <li>Nhấn nút "Thử lại" bên dưới</li>
                                    </ol>
                                </div>
                            </div>
                        ) : (
                            <p>Đã xảy ra lỗi khi tải danh sách sản phẩm.</p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <button
                            onClick={() => fetchProductData(0)}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            🔄 Thử lại
                        </button>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                            🏠 Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto p-6 bg-gradient-to-b from-white to-gray-50 text-gray-800 font-lato animate__animated animate__fadeIn min-h-screen">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Danh sách sản phẩm</h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Khám phá bộ sưu tập điện thoại và phụ kiện công nghệ chất lượng cao với giá tốt nhất
                </p>
            </div>

            {/* Product Controls */}
            <ProductControls
                products={allProducts}
                setFilterParams={setFilterParams}
                setSortCriteria={setSortCriteria}
            />

            {/* Products Count */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                    Hiển thị <span className="font-semibold text-blue-600">{products.length}</span> sản phẩm
                    {allProducts.length !== products.length && (
                        <span> từ <span className="font-semibold">{allProducts.length}</span> sản phẩm</span>
                    )}
                </p>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            handleAddToCart={handleAddToCart}
                            handleBuyNow={handleBuyNow}
                            formatPrice={formatPrice}
                        />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-gray-500 mb-4">Thử điều chỉnh bộ lọc để xem thêm sản phẩm</p>
                    <button
                        onClick={() => {
                            setFilterParams({ priceRange: { minValue: null, maxValue: null } });
                            setSortCriteria("");
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-3">
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`px-4 py-2 border rounded-lg transition-all duration-200 ${currentPage === index
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}

            <ToastContainer
                containerId="product-toast"
                position="top-center"
                autoClose={2000}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="dark"
                newestOnTop
                className="!fixed !top-[140px] !left-1/2 !-translate-x-1/2 !z-[1050] pointer-events-none"
            />
        </div>
    );
}

export default ProductPage;
