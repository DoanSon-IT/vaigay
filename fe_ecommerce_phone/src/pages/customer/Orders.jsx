import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import apiOrder from "../../api/apiOrder";
import apiPayment from "../../api/apiPayment";
import { addReview } from "../../api/apiReview";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import StarRatingInput from "../../components/review/StarRatingInput";
import "react-toastify/dist/ReactToastify.css";

// Custom CSS animations for empty state
const customStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }

  .animate-fade-in-delay {
    animation: fadeIn 0.8s ease-out 0.2s both;
  }

  .animate-fade-in-delay-2 {
    animation: fadeIn 0.8s ease-out 0.4s both;
  }

  .animate-fade-in-delay-3 {
    animation: fadeIn 0.8s ease-out 0.6s both;
  }

  .animate-fade-in-delay-4 {
    animation: fadeIn 0.8s ease-out 0.8s both;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
}

const Orders = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [reviewInputs, setReviewInputs] = useState({});
    const ordersPerPage = 5;

    const orderStatusTranslations = {
        PENDING: "Chờ xác nhận",
        CONFIRMED: "Đã xác nhận",
        SHIPPED: "Đang giao hàng",
        COMPLETED: "Giao hàng thành công",
        CANCELLED: "Đã hủy",
    };

    const paymentStatusTranslations = {
        PENDING: "Chờ thanh toán",
        PROCESSING: "Đang xử lý thanh toán",
        PAID: "Đã thanh toán",
        AWAITING_DELIVERY: "Chờ giao hàng",
        FAILED: "Thanh toán thất bại",
        CANCELLED: "Thanh toán bị hủy",
    };

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const ordersData = await apiOrder.getOrders();
            const sortedData = ordersData.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            // Không cần gọi apiPayment.getPayment, paymentStatus đã có trong ordersData
            setOrders(sortedData);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
            toast.error(error.message || "Không thể tải danh sách đơn hàng!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
            try {
                await apiOrder.cancelOrder(orderId);
                toast.success("Hủy đơn hàng thành công!");
                fetchOrders();
            } catch (error) {
                const message =
                    error.message.includes("trạng thái hiện tại")
                        ? "Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận!"
                        : error.message || "Không thể hủy đơn hàng!";
                toast.error(message);
            }
        }
    };

    const handleRatingChange = (detailId, rating) => {
        setReviewInputs((prev) => ({
            ...prev,
            [detailId]: {
                ...(prev[detailId] || {}),
                rating,
            },
        }));
    };

    const handleCommentChange = (detailId, comment) => {
        setReviewInputs((prev) => ({
            ...prev,
            [detailId]: {
                ...(prev[detailId] || {}),
                comment,
            },
        }));
    };

    const submitReview = async (orderDetailId) => {
        const review = reviewInputs[orderDetailId];

        if (!review?.rating) {
            return toast.error("Vui lòng chọn số sao!");
        }

        if ((review.comment || "").length > 300) {
            return toast.error("Bình luận không được vượt quá 300 ký tự!");
        }

        try {
            const payload = {
                orderDetailId,
                rating: review.rating,
                comment: review.comment || "",
            };

            await addReview(payload);
            toast.success("Gửi đánh giá thành công!");

            // Reset form input
            setReviewInputs((prev) => {
                const newInputs = { ...prev };
                delete newInputs[orderDetailId];
                return newInputs;
            });

            // Cập nhật lại đơn hàng từ backend
            await fetchOrders();
        } catch (err) {
            const msg = err?.response?.data?.message || "Gửi đánh giá thất bại!";
            toast.error(msg);
        }
    };

    const offset = currentPage * ordersPerPage;
    const currentPageData = orders.slice(offset, offset + ordersPerPage);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Đơn hàng của tôi
                </h2>

                {isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : orders.length === 0 ? (
                    // Empty State Component
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="text-center max-w-md mx-auto">
                            {/* Animated Shopping Bag Icon */}
                            <div className="relative mb-8">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
                                    <svg
                                        className="w-16 h-16 text-blue-500 animate-bounce"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
                                        />
                                    </svg>
                                </div>
                                {/* Floating dots animation */}
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            </div>

                            {/* Main Message */}
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 animate-fade-in">
                                Chưa có đơn hàng nào
                            </h3>

                            {/* Encouraging Message */}
                            <p className="text-gray-600 mb-2 leading-relaxed animate-fade-in-delay">
                                Bạn chưa thực hiện đơn hàng nào. Hãy khám phá những sản phẩm tuyệt vời của chúng tôi!
                            </p>

                            <p className="text-sm text-gray-500 mb-8 animate-fade-in-delay-2">
                                ✨ Nhiều ưu đãi hấp dẫn đang chờ bạn khám phá
                            </p>

                            {/* Call to Action Buttons */}
                            <div className="space-y-3 animate-fade-in-delay-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    🛍️ Bắt đầu mua sắm
                                </button>

                                <button
                                    onClick={() => navigate('/products')}
                                    className="w-full bg-white text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300"
                                >
                                    📱 Xem sản phẩm
                                </button>
                            </div>

                            {/* Additional Tips */}
                            <div className="mt-8 p-4 bg-blue-50 rounded-lg animate-fade-in-delay-4">
                                <p className="text-sm text-blue-700 font-medium mb-2">💡 Mẹo nhỏ:</p>
                                <ul className="text-xs text-blue-600 space-y-1 text-left">
                                    <li>• Đăng ký nhận thông báo để không bỏ lỡ khuyến mãi</li>
                                    <li>• Thêm sản phẩm yêu thích vào giỏ hàng</li>
                                    <li>• Theo dõi các deal hot hàng ngày</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {currentPageData.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">Đơn #{order.id}</h3>
                                        <p className="text-sm text-gray-600">
                                            Ngày đặt: {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm font-medium ${order.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : order.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : order.status === "CONFIRMED"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : order.status === "SHIPPED"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {orderStatusTranslations[order.status] || order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {order.orderDetails.map((detail) => (
                                        <div
                                            key={detail.id}
                                            className="flex flex-col gap-2 py-2 border-b border-gray-100"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={detail.productImage || "/placeholder.png"}
                                                        alt={detail.productName}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                    <div>
                                                        <span className="block font-medium text-gray-700">
                                                            {detail.productName}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Số lượng: {detail.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-gray-900 font-semibold">
                                                    {(detail.price * detail.quantity).toLocaleString()} VND
                                                </span>
                                            </div>

                                            {order.status === "COMPLETED" && !detail.review ? (
                                                <div className="mt-2 space-y-2 border-t pt-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Đánh giá sản phẩm:
                                                    </label>
                                                    <StarRatingInput
                                                        value={reviewInputs[detail.id]?.rating || 0}
                                                        onChange={(val) => handleRatingChange(detail.id, val)}
                                                    />
                                                    <textarea
                                                        maxLength={300}
                                                        rows={3}
                                                        className="w-full border rounded p-2 text-sm"
                                                        placeholder="Viết nhận xét (tối đa 300 ký tự)..."
                                                        value={reviewInputs[detail.id]?.comment || ""}
                                                        onChange={(e) =>
                                                            handleCommentChange(detail.id, e.target.value)
                                                        }
                                                    />
                                                    <div className="text-xs text-right text-gray-500">
                                                        {reviewInputs[detail.id]?.comment?.length || 0} / 300
                                                    </div>
                                                    <button
                                                        disabled={!reviewInputs[detail.id]?.rating}
                                                        onClick={() => submitReview(detail.id)}
                                                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Gửi đánh giá
                                                    </button>
                                                </div>
                                            ) : order.status === "COMPLETED" && detail.review ? (
                                                <div className="mt-2 border-t pt-2">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-yellow-500">
                                                                {"\u2B50".repeat(detail.review.rating)}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                ({detail.review.rating}/5)
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">
                                                            {detail.review.comment || "Không có bình luận"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t text-sm text-gray-600">
                                    <span>Phí giao hàng:</span>
                                    <span>{order.shippingFee?.toLocaleString()} VND</span>
                                </div>

                                <div className="flex justify-between items-center mt-4 border-t pt-4">
                                    <strong className="text-lg">Tổng tiền:</strong>
                                    <strong className="text-xl text-gray-900">
                                        {order.totalPrice.toLocaleString()} VND
                                    </strong>
                                </div>

                                {order.status === "PENDING" && (
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Hủy đơn hàng
                                    </button>
                                )}
                            </div>
                        ))}

                        <ReactPaginate
                            previousLabel={"Trước"}
                            nextLabel={"Sau"}
                            pageCount={Math.ceil(orders.length / ordersPerPage)}
                            onPageChange={({ selected }) => setCurrentPage(selected)}
                            containerClassName={"pagination flex justify-center space-x-2 my-8"}
                            activeClassName={"bg-blue-500 text-white px-3 py-1 rounded"}
                            pageClassName={"px-3 py-1 border rounded cursor-pointer"}
                        />
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Orders;