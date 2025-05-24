import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import apiOrder from "../../api/apiOrder";

import { addReview } from "../../api/apiReview";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";

import OrderProgressStepper from "../../components/order/OrderProgressStepper";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderDetailsCard from "../../components/order/OrderDetailsCard";
import OrderSummary from "../../components/order/OrderSummary";
import OrderStatusOverview from "../../components/order/OrderStatusOverview";
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
    const { } = useContext(AppContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [reviewInputs, setReviewInputs] = useState({});
    const [activeStatusFilter, setActiveStatusFilter] = useState("all");
    const ordersPerPage = 5;



    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const ordersData = await apiOrder.getOrders();
            const sortedData = ordersData.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            // Không cần gọi apiPayment.getPayment, paymentStatus đã có trong ordersData
            setOrders(sortedData);
            setFilteredOrders(sortedData); // Khởi tạo filtered orders
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
            toast.error(error.message || "Không thể tải danh sách đơn hàng!");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm filter đơn hàng theo trạng thái
    const handleStatusFilter = (status) => {
        setActiveStatusFilter(status);
        setCurrentPage(0); // Reset về trang đầu

        if (status === "all") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => order.status === status);
            setFilteredOrders(filtered);
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
    const currentPageData = filteredOrders.slice(offset, offset + ordersPerPage);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Đơn hàng của tôi
                </h2>

                {/* Order Status Overview */}
                {!isLoading && orders.length > 0 && (
                    <OrderStatusOverview
                        orders={orders}
                        onStatusFilter={handleStatusFilter}
                        activeFilter={activeStatusFilter}
                    />
                )}

                {isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
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
                                {orders.length === 0 ? "Chưa có đơn hàng nào" : "Không có đơn hàng nào"}
                            </h3>

                            {/* Encouraging Message */}
                            <p className="text-gray-600 mb-2 leading-relaxed animate-fade-in-delay">
                                {orders.length === 0
                                    ? "Bạn chưa thực hiện đơn hàng nào. Hãy khám phá những sản phẩm tuyệt vời của chúng tôi!"
                                    : `Không có đơn hàng nào với trạng thái "${activeStatusFilter === "all" ? "tất cả" :
                                        activeStatusFilter === "PENDING" ? "chờ xử lý" :
                                            activeStatusFilter === "CONFIRMED" ? "đã xác nhận" :
                                                activeStatusFilter === "SHIPPED" ? "đang giao" :
                                                    activeStatusFilter === "COMPLETED" ? "hoàn thành" :
                                                        activeStatusFilter === "CANCELLED" ? "đã hủy" : activeStatusFilter}".`
                                }
                            </p>

                            {orders.length === 0 && (
                                <p className="text-sm text-gray-500 mb-8 animate-fade-in-delay-2">
                                    ✨ Nhiều ưu đãi hấp dẫn đang chờ bạn khám phá
                                </p>
                            )}

                            {/* Call to Action Buttons */}
                            <div className="space-y-3 animate-fade-in-delay-3">
                                {orders.length === 0 ? (
                                    <>
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
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleStatusFilter("all")}
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        📋 Xem tất cả đơn hàng
                                    </button>
                                )}
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
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">Đơn #{order.id}</h3>
                                        <p className="text-sm text-gray-600">
                                            Ngày đặt: {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <OrderStatusBadge
                                            status={order.status}
                                            showIcon={true}
                                            size="md"
                                        />
                                    </div>
                                </div>

                                {/* Order Progress Stepper */}
                                <OrderProgressStepper
                                    currentStatus={order.status}
                                    createdAt={order.createdAt}
                                    showEstimatedTime={true}
                                    trackingNumber={order.trackingNumber}
                                    className="mb-6"
                                />

                                {/* Order Details */}
                                <OrderDetailsCard
                                    orderDetails={order.orderDetails}
                                    orderStatus={order.status}
                                    reviewInputs={reviewInputs}
                                    onRatingChange={handleRatingChange}
                                    onCommentChange={handleCommentChange}
                                    onSubmitReview={submitReview}
                                />

                                {/* Order Summary */}
                                <OrderSummary
                                    order={order}
                                    onCancelOrder={handleCancelOrder}
                                />
                            </div>
                        ))}

                        {filteredOrders.length > ordersPerPage && (
                            <ReactPaginate
                                previousLabel={"Trước"}
                                nextLabel={"Sau"}
                                pageCount={Math.ceil(filteredOrders.length / ordersPerPage)}
                                onPageChange={({ selected }) => setCurrentPage(selected)}
                                containerClassName={"pagination flex justify-center space-x-2 my-8"}
                                activeClassName={"bg-blue-500 text-white px-3 py-1 rounded"}
                                pageClassName={"px-3 py-1 border rounded cursor-pointer"}
                            />
                        )}
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Orders;