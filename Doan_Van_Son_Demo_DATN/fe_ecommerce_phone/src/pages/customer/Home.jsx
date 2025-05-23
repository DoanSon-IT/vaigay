import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";
import Slider from "../../components/layout/Slider";
import apiCategory from "../../api/apiCategory";
import useWindowSize from "../../hooks/useWindowSize";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const brands = [
        { name: "Apple", logo: "/brands/apple.png", productCount: 120 },
        { name: "Samsung", logo: "/brands/samsung.png", productCount: 110 },
        { name: "Xiaomi", logo: "/brands/xiaomi.png", productCount: 90 },
        { name: "OPPO", logo: "/brands/oppo.png", productCount: 85 },
        { name: "Vivo", logo: "/brands/vivo.png", productCount: 70 },
        { name: "Realme", logo: "/brands/realme.png", productCount: 65 },
        { name: "Huawei", logo: "/brands/huawei.png", productCount: 50 },
        { name: "Motorola", logo: "/brands/motorola.png", productCount: 40 },
        { name: "Infinix", logo: "/brands/infinix.png", productCount: 35 },
        { name: "Tecno", logo: "/brands/tecno.png", productCount: 30 },
    ];
    const windowSize = useWindowSize();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cachedCategories = localStorage.getItem("categories");
                if (cachedCategories) {
                    setCategories(JSON.parse(cachedCategories));
                } else {
                    const data = await apiCategory.getAllCategories();
                    const categoriesData = Array.isArray(data) ? data : data?.content || [];
                    setCategories(categoriesData);
                    localStorage.setItem("categories", JSON.stringify(categoriesData));
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800 font-mono">
            <div className="flex w-full">
                {/* Sidebar cố định TRÁI - Cập nhật theme đen sang chảnh */}
                <aside className="hidden lg:block w-[280px] bg-gradient-to-b from-gray-900 via-black to-gray-900 shadow-2xl border-r border-gray-800 flex-shrink-0 h-[calc(100vh-64px)] fixed top-[64px] left-0 z-[999] overflow-y-auto transition-all duration-500">
                    <div className="pt-8 flex flex-col items-center">
                        <div className="flex justify-center items-center p-4 mb-8 relative">
                            {/* Hiệu ứng ánh sáng chạy ngang cho tiêu đề */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-bounce" style={{ animationDuration: '3s' }}></div>
                            <span className="text-white text-2xl font-bold relative z-10 bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent">Danh mục</span>
                        </div>

                        <ul className="space-y-3 px-4 w-full">
                            {categories.map((category, index) => (
                                <li key={category.id} onMouseEnter={() => setHoverIndex(index)} onMouseLeave={() => setHoverIndex(null)}>
                                    <Link
                                        to={`/category/${category.id}`}
                                        className={`block w-full text-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${hoverIndex === index
                                            ? "bg-gradient-to-r from-gray-800 via-black to-gray-800 text-yellow-400 shadow-2xl scale-[1.02] border border-yellow-400/30"
                                            : "bg-gradient-to-r from-gray-800/90 via-gray-900 to-gray-800/90 text-white hover:bg-gradient-to-r hover:from-gray-700 hover:via-black hover:to-gray-700 hover:text-yellow-300 hover:shadow-xl hover:scale-[1.02] border border-gray-700"
                                            }`}
                                    >
                                        {/* Hiệu ứng ánh sáng khi hover */}
                                        {hoverIndex === index && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
                                        )}
                                        <span className="relative z-10">{category.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 px-4 w-full">
                            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl p-4 text-center text-sm shadow-2xl border border-gray-700 relative overflow-hidden">
                                {/* Hiệu ứng rực lửa cho help section */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 animate-pulse"></div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20 animate-bounce"></div>
                                <h3 className="font-bold text-white relative z-10">Cần trợ giúp?</h3>
                                <Link to="#" className="text-yellow-400 hover:text-yellow-300 hover:underline block mt-2 relative z-10 transition-colors duration-200">
                                    Trung tâm hỗ trợ
                                </Link>
                                <Link to="#" className="text-yellow-400 hover:text-yellow-300 hover:underline block mt-1 relative z-10 transition-colors duration-200">
                                    Câu hỏi thường gặp
                                </Link>
                            </div>
                        </div>

                        {/* <p className="text-center text-gray-400 text-xs italic mt-6 px-4 relative">
                            <span className="bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent font-semibold">
                                "Trải nghiệm công nghệ, nâng tầm cuộc sống."
                            </span>
                        </p> */}
                    </div>
                </aside>

                {/* Nội dung chính */}
                <div className="w-full lg:ml-[280px] xl:mr-[320px]">
                    <header className="w-full mb-4 relative z-20">
                        <Slider />
                        <p className="text-center text-sm md:text-base mt-2 text-gray-600 italic bg-gradient-to-r from-transparent via-gray-100 to-transparent py-2">
                            "Ít thì mua 10 cái, nhiều thì mua 100 cái!"
                        </p>
                    </header>

                    <section className="w-full mt-4 relative z-10">
                        <div className="relative bg-gradient-to-r from-black to-gray-800 shadow-2xl border border-gray-200 overflow-hidden rounded-lg">
                            <div className="absolute inset-0 opacity-10">
                                <div
                                    className="absolute inset-0 bg-repeat opacity-5"
                                    style={{
                                        backgroundImage:
                                            "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E')",
                                    }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-center py-8 md:py-12">
                                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white z-10 animate-pulse">
                                    ⚡ Săn Deal Siêu Chất ⚡
                                </h2>
                            </div>
                            <p className="text-center text-sm md:text-base text-gray-300 z-10 relative mb-4">
                                Giá sốc - Đỉnh cao công nghệ!
                            </p>
                            <div className="text-center pb-8">
                                <Link
                                    to="#"
                                    className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full text-base font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                                >
                                    Chốt ngay
                                </Link>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full">
                                <div className="flex justify-center gap-4 pb-2">
                                    <div className="flex items-center text-xs text-white">
                                        <span className="mr-1 text-yellow-400">✓</span> Giảm 50%
                                    </div>
                                    <div className="flex items-center text-xs text-white">
                                        <span className="mr-1 text-yellow-400">✓</span> Miễn phí ship
                                    </div>
                                    <div className="flex items-center text-xs text-white">
                                        <span className="mr-1 text-yellow-400">✓</span> Giao nhanh
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="w-full mt-10 z-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mt-4 mb-4 text-center">
                            Sản phẩm đỉnh nhất
                        </h2>
                        <div className="w-full max-w-screen-2xl mx-auto">
                            <ProductGrid category="featured" theme="light" />
                        </div>
                    </section>

                    <section className="w-full mt-12 pb-12 z-10">
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thương hiệu nổi bật</h2>
                                <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
                                <p className="text-base text-gray-600 mt-3">Các thương hiệu uy tín hàng đầu thế giới</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {brands.map((brand, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center group relative overflow-hidden"
                                    >
                                        <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-blue-100 opacity-10 group-hover:opacity-20 transition-opacity" />
                                        <div className="w-16 h-16 mb-3 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                                            <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
                                        </div>
                                        <span className="font-semibold text-base text-gray-800 group-hover:text-blue-600">{brand.name}</span>
                                        <span className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                            {brand.productCount}+ sản phẩm
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Panel thông tin bên phải - Theme đen sang chảnh với hiệu ứng đặc biệt */}
                <aside className="hidden xl:block w-[320px] bg-gradient-to-b from-gray-900 via-black to-gray-900 border-l border-gray-800 shadow-2xl flex-shrink-0 h-[calc(100vh-64px)] fixed top-[64px] right-0 z-[999] overflow-y-auto pt-16">
                    <div className="pt-8 flex flex-col gap-y-6 px-4">
                        {/* ƯU ĐÃI SỐC - Hiệu ứng ánh sáng chạy + lửa */}
                        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 rounded-xl shadow-2xl relative overflow-hidden border border-gray-700">
                            {/* Hiệu ứng ánh sáng chạy ngang */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-red-500 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>

                            {/* Hiệu ứng lửa */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500 rounded-full opacity-20 animate-bounce"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5 animate-pulse"></div>

                            <h3 className="font-bold text-white mb-3 flex items-center text-lg relative z-10">
                                <span className="mr-2 text-yellow-400 animate-bounce">🔥</span> ƯU ĐÃI SỐC
                            </h3>
                            <div className="space-y-2 text-gray-300 relative z-10">
                                <p className="flex items-center text-sm"><span className="w-5 inline-block text-yellow-400">-</span> Giảm 50% cho đơn hàng đầu tiên</p>
                                <p className="flex items-center text-sm"><span className="w-5 inline-block text-yellow-400">-</span> Miễn phí ship toàn quốc</p>
                                <p className="flex items-center text-sm"><span className="w-5 inline-block text-yellow-400">-</span> Đổi trả trong 30 ngày</p>
                            </div>
                            <div className="absolute top-2 right-2 z-20">
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-xs text-black font-bold shadow-lg">Hot</span>
                            </div>
                        </div>

                        {/* GIAO NHANH - Hiệu ứng tia sáng */}
                        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 rounded-xl shadow-2xl relative overflow-hidden border border-gray-700">
                            {/* Hiệu ứng tia sáng chạy chéo */}
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 via-transparent to-blue-400 animate-pulse"></div>
                            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-cyan-400 via-transparent to-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-cyan-500/5 to-blue-600/5 animate-pulse"></div>

                            <h3 className="font-bold text-white mb-3 flex items-center text-lg relative z-10">
                                <span className="mr-2 text-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }}>🚚</span> GIAO NHANH
                            </h3>
                            <div className="space-y-2 text-gray-300 relative z-10">
                                <p className="flex items-center text-sm bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-2 rounded-lg border border-gray-600">
                                    Nhận hàng trong 2h tại TP.HCM và Hà Nội
                                </p>
                            </div>
                            <div className="absolute top-2 right-2 z-20">
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-xs text-black font-bold shadow-lg">2h</span>
                            </div>
                        </div>

                        {/* HỖ TRỢ 24/7 - Hiệu ứng nhấp nháy */}
                        <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4 rounded-xl shadow-2xl relative overflow-hidden border border-gray-700">
                            {/* Hiệu ứng nhấp nháy 4 góc */}
                            <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                            <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute bottom-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute bottom-2 right-8 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>

                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 via-emerald-500/5 to-green-600/5 animate-pulse"></div>

                            <h3 className="font-bold text-white mb-3 flex items-center text-lg relative z-10">
                                <span className="mr-2 text-green-400 animate-bounce" style={{ animationDelay: '0.3s' }}>🎧</span> HỖ TRỢ 24/7
                            </h3>
                            <div className="space-y-2 text-gray-300 relative z-10">
                                <p className="flex items-center text-sm bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-2 rounded-lg border border-gray-600">
                                    Hotline: <span className="text-yellow-400 font-bold tracking-wide ml-2">1800-9999</span>
                                </p>
                            </div>
                            <div className="absolute top-2 right-2 z-20">
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-xs text-black font-bold shadow-lg">24/7</span>
                            </div>
                        </div>

                        {/* TIN TỨC MỚI - Hiệu ứng sóng ánh sáng */}
                        <div className="p-4 bg-gradient-to-br from-gray-800 via-black to-gray-900 rounded-xl shadow-2xl relative overflow-hidden border border-gray-700">
                            {/* Hiệu ứng sóng ánh sáng */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-pink-500/10 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>

                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/5 via-pink-500/5 to-purple-600/5 animate-pulse"></div>

                            <h3 className="font-bold text-white mb-3 flex items-center text-lg relative z-10">
                                <span className="mr-2 text-purple-400 animate-bounce" style={{ animationDelay: '0.4s' }}>📰</span> TIN TỨC MỚI
                            </h3>
                            <ul className="text-sm space-y-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-3 rounded-lg border border-gray-600 relative z-10">
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-yellow-400 hover:underline flex items-center transition-colors duration-200">
                                        <span className="text-yellow-400 mr-2 animate-pulse">•</span>
                                        iPhone 16 sắp ra mắt
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-yellow-400 hover:underline flex items-center transition-colors duration-200">
                                        <span className="text-yellow-400 mr-2 animate-pulse" style={{ animationDelay: '0.5s' }}>•</span>
                                        Top 5 laptop bán chạy nhất
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-yellow-400 hover:underline flex items-center transition-colors duration-200">
                                        <span className="text-yellow-400 mr-2 animate-pulse" style={{ animationDelay: '1s' }}>•</span>
                                        Mẹo tăng thời lượng pin
                                    </a>
                                </li>
                            </ul>
                            <div className="absolute top-2 right-2 z-20">
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-xs text-black font-bold shadow-lg">New</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Home;