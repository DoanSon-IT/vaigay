import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiOrder from "../../api/apiOrder";
import apiPayment from "../../api/apiPayment";
import "react-toastify/dist/ReactToastify.css";

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const hasInitialized = useRef(false); // Prevent double initialization

    const statusTranslations = {
        PENDING: "Chờ thanh toán",
        PROCESSING: "Đang xử lý thanh toán",
        PAID: "Đã thanh toán",
        AWAITING_DELIVERY: "Chờ giao hàng",
        FAILED: "Thanh toán thất bại",
        CANCELLED: "Thanh toán bị hủy",
    };

    const defaultOrderDetails = state?.orderDetails || {
        orderId: "Chưa có ID",
        totalPrice: 0,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        shippingFee: 0,
        products: [],
    };

    const fetchOrderDetails = async (isRetry = false) => {
        try {
            const orderId = state?.orderDetails?.orderId;
            if (!orderId || orderId === "Chưa có ID") {
                throw new Error("Không tìm thấy mã đơn hàng.");
            }

            const order = await apiOrder.getOrderById(orderId);
            let payment = null;

            // Sử dụng payment data từ order response nếu có
            if (order.payment) {
                payment = order.payment;
                if (!isRetry) { // Chỉ log lần đầu tiên
                    console.log("✅ Lấy payment từ order response:", payment);
                }
            } else {
                // Fallback: thử gọi API payment riêng biệt
                try {
                    payment = await apiPayment.getPayment(orderId);
                    if (!isRetry) { // Chỉ log lần đầu tiên
                        console.log("✅ Lấy payment từ API riêng biệt:", payment);
                    }
                } catch (paymentError) {
                    if (!isRetry) { // Chỉ log lần đầu tiên
                        console.warn("⚠️ Không thể lấy payment từ API:", paymentError.message);
                    }
                    // Sử dụng dữ liệu từ state nếu có
                    payment = {
                        paymentMethod: state?.orderDetails?.paymentMethod || "COD",
                        status: state?.orderDetails?.paymentStatus || "PENDING"
                    };
                }
            }

            const updatedOrderDetails = {
                orderId: order.id,
                totalPrice: order.totalPrice || 0,
                paymentMethod: payment?.paymentMethod || "UNKNOWN",
                paymentStatus: payment?.status || "PENDING",
                shippingFee: order.shippingFee || 0,
                products: order.orderDetails?.map((detail) => ({
                    name: detail.productName,
                    quantity: detail.quantity,
                    price: detail.price,
                })) || [],
                transactionId: payment?.transactionId || null,
            };

            setOrderDetails(updatedOrderDetails);

            // Hiển thị thông báo dựa trên trạng thái thanh toán
            if (payment?.status === "PAID" || payment?.status === "AWAITING_DELIVERY") {
                toast.success("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
            } else if (payment?.status === "FAILED" || payment?.status === "CANCELLED") {
                toast.error("Thanh toán không thành công. Vui lòng thử lại.");
            } else if (payment?.status === "PROCESSING" && retryCount < maxRetries) {
                console.log(`🔄 Payment đang xử lý, thử lại lần ${retryCount + 1}/${maxRetries}`);
                setTimeout(() => {
                    setRetryCount(retryCount + 1);
                    fetchOrderDetails(true); // Đánh dấu là retry
                }, 2000);
            }
        } catch (error) {
            console.error("❌ Lỗi lấy chi tiết đơn hàng:", error);
            toast.error(error.message || "Không thể tải thông tin đơn hàng! Sử dụng dữ liệu tạm thời.");
            setOrderDetails(defaultOrderDetails);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Prevent double execution in React StrictMode
        if (retryCount === 0 && hasInitialized.current) return;

        if (retryCount === 0) {
            hasInitialized.current = true;
        }

        fetchOrderDetails(retryCount > 0);
    }, [retryCount]);

    if (isLoading) {
        return (
            <div className="max-w-screen-2xl mx-auto p-9 pt-24 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (!orderDetails) {
        return (
            <div className="max-w-screen-2xl mx-auto p-9 pt-24">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Lỗi xác nhận đơn hàng
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto p-9 pt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Xác nhận đơn hàng
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn.
            </p>

            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium">Thông tin đơn hàng</h3>
                <div className="mt-4 space-y-2">
                    <p>
                        <strong>Mã đơn hàng:</strong> {orderDetails.orderId}
                    </p>
                    <p>
                        <strong>Phương thức thanh toán:</strong>{" "}
                        {orderDetails.paymentMethod === "VNPAY" ? "VNPay" : orderDetails.paymentMethod}
                    </p>
                    <p>
                        <strong>Trạng thái thanh toán:</strong>{" "}
                        {statusTranslations[orderDetails.paymentStatus] || orderDetails.paymentStatus}
                    </p>
                    {orderDetails.transactionId && (
                        <p>
                            <strong>Mã giao dịch:</strong> {orderDetails.transactionId}
                        </p>
                    )}
                    <p>
                        <strong>Phí giao hàng:</strong>{" "}
                        {orderDetails.shippingFee.toLocaleString("vi-VN")} VND
                    </p>
                    <p>
                        <strong>Tổng tiền:</strong>{" "}
                        {orderDetails.totalPrice.toLocaleString("vi-VN")} VND
                    </p>
                </div>

                <h3 className="mt-6 text-lg font-medium">Sản phẩm đã đặt</h3>
                {orderDetails.products.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                        {orderDetails.products.map((item, index) => (
                            <li key={index} className="flex justify-between">
                                <span>
                                    {item.name || "Unknown Product"} (x{item.quantity || 1})
                                </span>
                                <span>
                                    {(item.price * item.quantity).toLocaleString("vi-VN")} VND
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Không có sản phẩm nào được hiển thị.
                    </p>
                )}
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Xem đơn hàng của tôi
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Tiếp tục mua sắm
                </button>
            </div>

            <ToastContainer />
        </div>
    );
};

export default OrderConfirmation;