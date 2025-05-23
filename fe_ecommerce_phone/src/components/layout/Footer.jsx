import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white relative overflow-hidden z-40">
            {/* Background decorative elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-green-400 to-cyan-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">📱</span>
                            </div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                PhoneStore
                            </h2>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Cửa hàng điện thoại uy tín #1 Việt Nam với hơn 10 năm kinh nghiệm.
                            Chuyên cung cấp các sản phẩm công nghệ chính hãng.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110">
                                <span className="text-white text-sm">📘</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-pink-600 to-rose-700 rounded-full flex items-center justify-center hover:from-pink-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-110">
                                <span className="text-white text-sm">📷</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center hover:from-green-500 hover:to-green-600 transition-all duration-300 transform hover:scale-110">
                                <span className="text-white text-sm">💬</span>
                            </a>
                            <a href="#" className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:scale-110">
                                <span className="text-white text-sm">📺</span>
                            </a>
                        </div>
                    </div>

                    {/* Product Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-yellow-400 flex items-center">
                            <span className="mr-2">📱</span>
                            Sản phẩm
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/products?category=smartphone" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">📱</span>
                                    Điện thoại thông minh
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=tablet" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">📟</span>
                                    Máy tính bảng
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=accessories" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">🎧</span>
                                    Phụ kiện
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=smartwatch" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">⌚</span>
                                    Đồng hồ thông minh
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-yellow-400 flex items-center">
                            <span className="mr-2">🎧</span>
                            Hỗ trợ khách hàng
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">📞</span>
                                    Liên hệ
                                </Link>
                            </li>
                            <li>
                                <Link to="/warranty" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">🛡️</span>
                                    Bảo hành
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">🚚</span>
                                    Giao hàng
                                </Link>
                            </li>
                            <li>
                                <Link to="/return-policy" className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 flex items-center group">
                                    <span className="mr-2 group-hover:scale-110 transition-transform duration-300">↩️</span>
                                    Đổi trả
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-yellow-400 flex items-center">
                            <span className="mr-2">📍</span>
                            Thông tin liên hệ
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <span className="text-blue-400 mt-1">🏢</span>
                                <div>
                                    <p className="text-gray-300 text-sm font-medium">Cửa hàng chính</p>
                                    <p className="text-gray-400 text-xs">123 Đường Công Nghệ, Q.1, TP.HCM</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-green-400 mt-1">📞</span>
                                <div>
                                    <p className="text-gray-300 text-sm font-medium">Hotline</p>
                                    <p className="text-yellow-400 text-sm font-bold">1800-1234</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-purple-400 mt-1">✉️</span>
                                <div>
                                    <p className="text-gray-300 text-sm font-medium">Email</p>
                                    <p className="text-gray-400 text-xs">support@phonestore.vn</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-orange-400 mt-1">⏰</span>
                                <div>
                                    <p className="text-gray-300 text-sm font-medium">Giờ làm việc</p>
                                    <p className="text-gray-400 text-xs">8:00 - 22:00 (T2-CN)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider with gradient */}
                <div className="my-12 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>

                {/* Bottom Section */}
                <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                        <p className="text-gray-400 text-sm">
                            © 2024 PhoneStore. All rights reserved.
                        </p>
                        <div className="flex space-x-4 text-xs">
                            <Link to="/privacy" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                                Chính sách bảo mật
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                                Điều khoản sử dụng
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span className="text-green-400">🔒</span>
                            <span>Thanh toán an toàn</span>
                        </div>
                        <div className="flex space-x-2">
                            <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">V</span>
                            </div>
                            <div className="w-8 h-5 bg-gradient-to-r from-red-600 to-red-700 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">M</span>
                            </div>
                            <div className="w-8 h-5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">₿</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating elements for extra visual appeal */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '1s' }}></div>
            </div>
        </footer>
    );
}

export default Footer;