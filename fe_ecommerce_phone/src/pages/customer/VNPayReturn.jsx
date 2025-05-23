import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiOrder from "../../api/apiOrder";
import apiPayment from "../../api/apiPayment";
import "react-toastify/dist/ReactToastify.css";

const VNPayReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const hasProcessed = useRef(false); // Prevent double processing

    useEffect(() => {
        // Prevent double execution in React StrictMode
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const handleVNPayReturn = async () => {
            try {
                // Get all VNPay parameters
                const vnpResponseCode = searchParams.get("vnp_ResponseCode");
                const vnpTxnRef = searchParams.get("vnp_TxnRef");
                const vnpTransactionNo = searchParams.get("vnp_TransactionNo");
                const vnpAmount = searchParams.get("vnp_Amount");
                const vnpBankCode = searchParams.get("vnp_BankCode");
                const vnpPayDate = searchParams.get("vnp_PayDate");
                const vnpOrderInfo = searchParams.get("vnp_OrderInfo");

                console.log("VNPay Return Parameters:", {
                    vnpResponseCode,
                    vnpTxnRef,
                    vnpTransactionNo,
                    vnpAmount,
                    vnpBankCode,
                    vnpPayDate,
                    vnpOrderInfo,
                });

                // Validate required parameters
                if (!vnpTxnRef) {
                    throw new Error("Không tìm thấy mã giao dịch từ VNPay");
                }

                // Check if payment failed
                if (vnpResponseCode !== "00") {
                    let errorMessage = "Thanh toán thất bại";
                    switch (vnpResponseCode) {
                        case "07":
                            errorMessage = "Thanh toán bị từ chối bởi ngân hàng";
                            break;
                        case "09":
                            errorMessage = "Thẻ/Tài khoản không hợp lệ";
                            break;
                        case "10":
                            errorMessage = "Xác thực thông tin thẻ không thành công";
                            break;
                        case "11":
                            errorMessage = "Giao dịch đã hết hạn";
                            break;
                        case "24":
                            errorMessage = "Giao dịch không thành công";
                            break;
                        case "51":
                            errorMessage = "Tài khoản không đủ số dư";
                            break;
                        case "65":
                            errorMessage = "Tài khoản đã vượt quá hạn mức giao dịch";
                            break;
                        case "75":
                            errorMessage = "Ngân hàng đang bảo trì";
                            break;
                        case "99":
                            errorMessage = "Lỗi không xác định từ ngân hàng";
                            break;
                        default:
                            errorMessage = `Thanh toán thất bại (Mã lỗi: ${vnpResponseCode})`;
                    }
                    throw new Error(errorMessage);
                }

                // Payment succeeded - Get order details
                const order = await apiOrder.getOrderById(vnpTxnRef);

                // ✅ CẬP NHẬT PAYMENT STATUS TRONG DATABASE
                try {
                    console.log("🔄 Cập nhật payment status cho đơn hàng:", vnpTxnRef);

                    // Kiểm tra xem đã cập nhật chưa để tránh duplicate
                    const existingPayment = await apiPayment.getPayment(vnpTxnRef);
                    if (existingPayment && existingPayment.status === 'PAID') {
                        console.log("✅ Payment đã được cập nhật trước đó, bỏ qua callback");
                    } else {
                        // Gọi backend callback để cập nhật payment status
                        const callbackParams = new URLSearchParams();
                        callbackParams.append('vnp_ResponseCode', vnpResponseCode);
                        callbackParams.append('vnp_TxnRef', vnpTxnRef);
                        callbackParams.append('vnp_TransactionNo', vnpTransactionNo);
                        callbackParams.append('vnp_Amount', vnpAmount);
                        callbackParams.append('vnp_BankCode', vnpBankCode);
                        callbackParams.append('vnp_PayDate', vnpPayDate);
                        callbackParams.append('vnp_OrderInfo', vnpOrderInfo);

                        const callbackResponse = await fetch(`http://localhost:8080/api/payments/vnpay/callback?${callbackParams.toString()}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });

                        const callbackResult = await callbackResponse.json();
                        console.log("✅ Callback response:", callbackResult);

                        if (callbackResult.status === 'success') {
                            console.log("✅ Payment status đã được cập nhật thành công!");
                        } else {
                            console.warn("⚠️ Callback không thành công:", callbackResult.message);
                        }
                    }
                } catch (callbackError) {
                    console.error("❌ Lỗi khi cập nhật payment status:", callbackError);
                    // Không throw error ở đây để không làm gián đoạn flow
                }

                // Prepare order details for confirmation page
                const details = {
                    orderId: order.id,
                    paymentMethod: "VNPAY",
                    totalPrice: order.totalPrice || 0,
                    shippingFee: order.shippingFee || 0,
                    paymentStatus: "PAID",
                    transactionId: vnpTransactionNo,
                    bankCode: vnpBankCode,
                    paymentDate: formatVNPayDate(vnpPayDate),
                    products: Array.isArray(order.orderDetails)
                        ? order.orderDetails.map((item) => ({
                            name: item.productName || "Unknown Product",
                            quantity: item.quantity || 1,
                            price: item.price || 0,
                        }))
                        : [],
                };

                setOrderDetails(details);
                toast.success("Thanh toán thành công!");

                // ✅ KHÔNG TỰ ĐỘNG CHUYỂN HƯỚNG - Để người dùng tự quyết định
            } catch (error) {
                console.error("Lỗi xử lý kết quả thanh toán:", error);
                setError(error.message || "Lỗi xử lý kết quả thanh toán");
                toast.error(error.message || "Lỗi xử lý kết quả thanh toán");

                // Redirect back to cart after showing error
                setTimeout(() => navigate("/cart"), 3000);
            } finally {
                setLoading(false);
            }
        };

        // Helper function to format VNPay date (yyyyMMddHHmmss) to readable format
        const formatVNPayDate = (vnpayDate) => {
            if (!vnpayDate) return "";
            try {
                const year = vnpayDate.substring(0, 4);
                const month = vnpayDate.substring(4, 6);
                const day = vnpayDate.substring(6, 8);
                const hour = vnpayDate.substring(8, 10);
                const minute = vnpayDate.substring(10, 12);
                const second = vnpayDate.substring(12, 14);
                return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
            } catch (e) {
                console.error("Lỗi định dạng ngày VNPay:", e);
                return vnpayDate;
            }
        };

        handleVNPayReturn();

        // Cleanup function để reset flag khi component unmount
        return () => {
            hasProcessed.current = false;
        };
    }, []); // Empty dependency array để chỉ chạy một lần

    return (
        <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                {loading ? (
                    <>
                        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">
                            Đang xử lý kết quả thanh toán...
                        </p>
                    </>
                ) : error ? (
                    <div className="text-red-500">
                        <svg
                            className="w-12 h-12 mx-auto text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <h3 className="text-xl font-bold mt-4">Thanh toán không thành công</h3>
                        <p className="mt-2">{error}</p>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            Bạn sẽ được chuyển về giỏ hàng...
                        </p>
                    </div>
                ) : (
                    <div className="text-green-500">
                        <svg
                            className="w-12 h-12 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                        <h3 className="text-xl font-bold mt-4">Thanh toán thành công!</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Đơn hàng #{orderDetails?.orderId} đã được xác nhận
                        </p>
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="font-medium">Số tiền: {(orderDetails?.totalPrice || 0).toLocaleString("vi-VN")} VND</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Mã giao dịch: {orderDetails?.transactionId}
                            </p>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate("/order-confirmation", { state: { orderDetails } })}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Xem chi tiết đơn hàng
                            </button>
                            <button
                                onClick={() => navigate("/orders")}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                                Đơn hàng của tôi
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VNPayReturn;