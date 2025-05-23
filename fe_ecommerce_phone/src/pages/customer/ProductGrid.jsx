import React, { useState, useEffect, useContext } from "react";
import { useInView } from "react-intersection-observer";
import apiProduct from "../../api/apiProduct";
import ProductControls from "../../components/product/ProductControls";
import ProductCounter from "../../components/product/ProductCounter";
import ProductCard from "../../components/product/ProductCard";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check, Flame, Clock, TrendingUp } from "lucide-react";
import AppContext from "../../context/AppContext";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const ITEMS_PER_PAGE = 12;

function ProductGrid({ category, theme }) {
    const { addToCart } = useContext(AppContext);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newestProducts, setNewestProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [filterParams, setFilterParams] = useState({ priceRange: { minValue: null, maxValue: null } });
    const [sortCriteria, setSortCriteria] = useState("");

    const [newestRef, newestInView] = useInView({ triggerOnce: false, threshold: 0.1 });
    const [bestSellingRef, bestSellingInView] = useInView({ triggerOnce: false, threshold: 0.1 });
    const [featuredRef, featuredInView] = useInView({ triggerOnce: false, threshold: 0.1 });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (newestInView && newestProducts.length === 0) fetchNewestProducts();
        if (bestSellingInView && bestSellingProducts.length === 0) fetchBestSellingProducts();
        if (featuredInView && featuredProducts.length === 0) fetchFeaturedProducts();
    }, [newestInView, bestSellingInView, featuredInView]);

    useEffect(() => {
        fetchProducts();
    }, [page, filterParams, sortCriteria]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            await fetchFeaturedProducts();
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu ban đầu:", error);
            toast.error("Không thể tải dữ liệu!", { autoClose: 2000 });
        }
        setIsLoading(false);
    };

    const fetchFeaturedProducts = async () => {
        try {
            const featured = await apiProduct.getFeaturedProducts();
            const featuredData = Array.isArray(featured) ? featured : [];
            setFeaturedProducts(featuredData);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm nổi bật:", error);
            setFeaturedProducts([]);
        }
    };

    const fetchNewestProducts = async () => {
        try {
            const newest = await apiProduct.getNewestProducts(5);
            setNewestProducts(Array.isArray(newest) ? newest : []);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm mới:", error);
        }
    };

    const fetchBestSellingProducts = async () => {
        try {
            const bestSelling = await apiProduct.getBestSellingProducts(5);
            setBestSellingProducts(Array.isArray(bestSelling) ? bestSelling : []);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await apiProduct.getFilteredProducts(
                "",
                filterParams.priceRange.minValue,
                filterParams.priceRange.maxValue,
                sortCriteria,
                page,
                ITEMS_PER_PAGE
            );
            const productsData = response?.content || response || [];
            setProducts((prev) => (page === 0 ? productsData : [...prev, ...productsData]));
            setTotalProducts(response?.totalElements || productsData.length);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            setProducts([]);
            toast.error("Không thể tải sản phẩm!", { autoClose: 2000 });
        }
        setIsLoading(false);
    };

    const handleLoadMore = () => {
        if (products.length < totalProducts) setPage((prev) => prev + 1);
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);

    const uniqueProducts = products.filter((p, i, self) => i === self.findIndex((t) => t.id === p.id));

    const handleAddToCart = (product) => {
        toast(
            <div className="flex items-center w-full p-2 bg-gray-900 border-2 border-[#00ffcc] rounded-lg shadow-[0_0_10px_#00ffcc]">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <ShoppingCart className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-white">{`${product.name} đã được thêm vào giỏ hàng!`}</span>
            </div>,
            { autoClose: 1500, position: "top-center", hideProgressBar: true }
        );
        addToCart({
            id: product.id,
            name: product.name || "Sản phẩm không tên",
            price: product.discountedPrice ?? product.sellingPrice,
            originalPrice: product.sellingPrice,
            images: product.images || [],
        });
    };

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    return (
        <div className={`w-full ${theme === "dark" ? "bg-black text-white" : "bg-white text-gray-800"} font-lato min-h-screen`}>
            <section className="mb-4 sm:mb-6 md:mb-8" ref={featuredRef}>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500 mr-1 sm:mr-2" />
                    <span className="text-sm sm:text-base md:text-lg lg:text-xxl">Sản phẩm nổi bật</span>
                </h2>
                {isLoading ? (
                    <p className="text-center text-gray-400 text-xs sm:text-sm md:text-base">Đang tải...</p>
                ) : featuredProducts.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {featuredProducts.slice(0, 10).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFeatured={true}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                formatPrice={formatPrice}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-400 text-xs sm:text-sm md:text-base">Chưa có sản phẩm nổi bật.</p>
                )}
            </section>

            <section className="mb-4 sm:mb-6 md:mb-8" ref={newestRef}>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500 mr-1 sm:mr-2" />
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl">Sản phẩm mới nhất</span>
                </h2>
                {newestProducts.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {newestProducts.slice(0, 5).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                formatPrice={formatPrice}
                            />
                        ))}
                    </ul>
                ) : newestInView ? (
                    <p className="text-center text-gray-400 text-xs sm:text-sm md:text-base">Đang tải...</p>
                ) : null}
            </section>

            <section className="mb-4 sm:mb-6 md:mb-8" ref={bestSellingRef}>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500 mr-1 sm:mr-2" />
                    <span className="text-sm sm:text-base md:text-lg lg:text-xl">Sản phẩm bán chạy</span>
                </h2>
                {bestSellingProducts.length > 0 ? (
                    <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {bestSellingProducts.slice(0, 5).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                formatPrice={formatPrice}
                            />
                        ))}
                    </ul>
                ) : bestSellingInView ? (
                    <p className="text-center text-gray-400 text-xs sm:text-sm md:text-base">Đang tải...</p>
                ) : null}
            </section>

            <section className="mb-4 sm:mb-6 md:mb-8">
                <ProductControls
                    products={uniqueProducts}
                    setFilterParams={setFilterParams}
                    setSortCriteria={setSortCriteria}
                />
            </section>

            <section className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 md:mb-4 gap-2 sm:gap-4">
                    <ProductCounter total={totalProducts} />
                </div>
                {isLoading && page === 0 ? (
                    <p className="text-center text-gray-400 text-xs sm:text-sm md:text-base">Đang tải sản phẩm...</p>
                ) : uniqueProducts.length > 0 ? (
                    <>
                        <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {uniqueProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    handleAddToCart={handleAddToCart}
                                    handleBuyNow={handleBuyNow}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="col-span-full text-center text-gray-400 text-xs sm:text-sm md:text-base">Không có sản phẩm phù hợp.</p>
                )}
                {uniqueProducts.length < totalProducts && (
                    <div className="mt-4 sm:mt-5 md:mt-6 text-center">
                        <button
                            onClick={handleLoadMore}
                            className="bg-blue-600 text-white py-1.5 sm:py-2 px-4 sm:px-6 rounded-full hover:bg-blue-700 transition-colors text-xs sm:text-sm md:text-base"
                        >
                            Xem thêm
                        </button>
                    </div>
                )}
            </section>

            <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar
                theme={theme === "dark" ? "dark" : "dark"}
                className="text-xs sm:text-sm md:text-base"
            />
        </div>
    );
}

export default ProductGrid;