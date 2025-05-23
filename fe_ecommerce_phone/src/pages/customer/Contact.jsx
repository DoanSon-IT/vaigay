import React from "react";
import { motion } from "framer-motion";

const Contact = () => {
    const contactInfo = [
        {
            icon: "📍",
            title: "Địa chỉ cửa hàng",
            details: [
                "🏢 Cửa hàng chính: 123 Đường Công Nghệ, Quận 1, TP.HCM",
                "🏪 Chi nhánh Hà Nội: 456 Phố Huế, Hai Bà Trưng, Hà Nội",
                "🏬 Chi nhánh Đà Nẵng: 789 Lê Duẩn, Hải Châu, Đà Nẵng"
            ],
            gradient: "from-blue-500 to-purple-600"
        },
        {
            icon: "📞",
            title: "Hotline hỗ trợ",
            details: [
                "☎️ Tư vấn bán hàng: 1800-1234 (miễn phí)",
                "🛠️ Hỗ trợ kỹ thuật: 1800-5678 (24/7)",
                "📦 Tra cứu đơn hàng: 1800-9999"
            ],
            gradient: "from-green-500 to-blue-600"
        },
        {
            icon: "✉️",
            title: "Email liên hệ",
            details: [
                "💼 Hợp tác kinh doanh: business@phonestore.vn",
                "🛒 Hỗ trợ khách hàng: support@phonestore.vn",
                "📢 Báo chí truyền thông: media@phonestore.vn"
            ],
            gradient: "from-purple-500 to-pink-600"
        },
        {
            icon: "⏰",
            title: "Giờ làm việc",
            details: [
                "🌅 Thứ 2 - Thứ 6: 8:00 - 22:00",
                "🌄 Thứ 7 - Chủ nhật: 9:00 - 21:00",
                "🌙 Hỗ trợ online: 24/7"
            ],
            gradient: "from-yellow-500 to-orange-600"
        }
    ];

    const services = [
        {
            icon: "🚚",
            title: "Giao hàng nhanh",
            description: "Giao hàng trong 2h tại nội thành, 24h toàn quốc"
        },
        {
            icon: "🔧",
            title: "Bảo hành uy tín",
            description: "Bảo hành chính hãng, đổi trả trong 30 ngày"
        },
        {
            icon: "💳",
            title: "Thanh toán đa dạng",
            description: "Hỗ trợ nhiều hình thức: tiền mặt, thẻ, ví điện tử"
        },
        {
            icon: "🎁",
            title: "Ưu đãi hấp dẫn",
            description: "Khuyến mãi thường xuyên, tích điểm đổi quà"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Liên hệ với chúng tôi
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-6"></div>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn! Với đội ngũ tư vấn chuyên nghiệp và dịch vụ khách hàng tận tâm,
                        hãy liên hệ với chúng tôi bất cứ khi nào bạn cần.
                    </p>
                </motion.div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {contactInfo.map((info, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            <div className={`h-2 bg-gradient-to-r ${info.gradient}`}></div>
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-3xl mr-3 group-hover:scale-110 transition-transform duration-300">
                                        {info.icon}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-800">{info.title}</h3>
                                </div>
                                <div className="space-y-2">
                                    {info.details.map((detail, idx) => (
                                        <p key={idx} className="text-gray-600 flex items-center">
                                            {detail}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Services Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Dịch vụ của chúng tôi</h2>
                        <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-center group hover:-translate-y-2"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
                                <p className="text-gray-600 text-sm">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Credibility and FAQ Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Credibility Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-3">🏆</span>
                                Uy tín & Chất lượng
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-400">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2">🥇</span>
                                        Top 1 Cửa hàng uy tín
                                    </h4>
                                    <p className="text-sm text-gray-600">Được bình chọn là cửa hàng điện thoại uy tín nhất năm 2024</p>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-400">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2">🛡️</span>
                                        Chính hãng 100%
                                    </h4>
                                    <p className="text-sm text-gray-600">Cam kết tất cả sản phẩm đều chính hãng, có tem bảo hành</p>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-400">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2">⭐</span>
                                        4.9/5 sao đánh giá
                                    </h4>
                                    <p className="text-sm text-gray-600">Hơn 100,000 đánh giá tích cực từ khách hàng</p>
                                </div>

                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-400">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2">🎖️</span>
                                        Chứng nhận ISO 9001
                                    </h4>
                                    <p className="text-sm text-gray-600">Đạt chuẩn quốc tế về chất lượng dịch vụ</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.0 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                        <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-3">❓</span>
                                Câu hỏi thường gặp
                            </h3>
                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-3">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2 text-blue-500">Q:</span>
                                        Làm sao để kiểm tra bảo hành?
                                    </h4>
                                    <p className="text-sm text-gray-600 ml-6">
                                        Bạn có thể kiểm tra bảo hành qua website hoặc gọi hotline với mã IMEI sản phẩm.
                                    </p>
                                </div>

                                <div className="border-b border-gray-100 pb-3">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2 text-green-500">Q:</span>
                                        Có hỗ trợ trả góp không?
                                    </h4>
                                    <p className="text-sm text-gray-600 ml-6">
                                        Có, chúng tôi hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng và các công ty tài chính.
                                    </p>
                                </div>

                                <div className="border-b border-gray-100 pb-3">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2 text-purple-500">Q:</span>
                                        Thời gian giao hàng bao lâu?
                                    </h4>
                                    <p className="text-sm text-gray-600 ml-6">
                                        Nội thành: 2-4h, ngoại thành: 1-2 ngày, tỉnh khác: 2-3 ngày.
                                    </p>
                                </div>

                                <div className="border-b border-gray-100 pb-3">
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2 text-orange-500">Q:</span>
                                        Có đổi trả sản phẩm không?
                                    </h4>
                                    <p className="text-sm text-gray-600 ml-6">
                                        Đổi trả trong 30 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                        <span className="mr-2 text-red-500">Q:</span>
                                        Làm sao để được tư vấn?
                                    </h4>
                                    <p className="text-sm text-gray-600 ml-6">
                                        Gọi hotline 1800-1234 hoặc chat trực tuyến trên website 24/7.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Call to Action Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-center text-white relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full animate-ping"></div>
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Sẵn sàng mua sắm cùng chúng tôi?</h2>
                        <p className="text-lg mb-6 opacity-90">
                            Khám phá hàng ngàn sản phẩm công nghệ chất lượng với giá tốt nhất!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                🛍️ Xem sản phẩm
                            </button>
                            <button className="bg-yellow-400 text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                📞 Gọi ngay: 1800-1234
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
