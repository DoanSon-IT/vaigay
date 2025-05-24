import React, { useState, useContext } from "react";
import {
    CurrencyDollarIcon,
    TruckIcon,
    ReceiptPercentIcon,
    PrinterIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import AppContext from "../../context/AppContext";
import InvoicePrintModal from "./InvoicePrintModal";

const OrderSummary = ({
    order,
    onCancelOrder
}) => {
    const { addToCart } = useContext(AppContext);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const subtotal = order.orderDetails.reduce((sum, detail) =>
        sum + (detail.price * detail.quantity), 0
    );

    const handleReorder = async () => {
        setIsReordering(true);
        try {
            let addedCount = 0;

            // Debug: Log order structure
            console.log("Order data for reorder:", order);
            console.log("Order details:", order.orderDetails);

            // Thêm tất cả sản phẩm từ đơn hàng vào giỏ hàng
            order.orderDetails.forEach(detail => {
                console.log("Processing detail:", detail);

                // Tạo cartItem với cấu trúc phù hợp với addToCart
                const cartItem = {
                    id: detail.productId || detail.product?.id || detail.id,
                    name: detail.productName || detail.product?.name || "Sản phẩm",
                    price: detail.price,
                    // Xử lý images - backend trả về productImage (string), cần chuyển thành array
                    images: detail.productImage ? [{ imageUrl: detail.productImage }] :
                        detail.product?.images ||
                        [{ imageUrl: "/placeholder.png" }],
                    // Thêm các thuộc tính cần thiết cho cart
                    originalPrice: detail.product?.sellingPrice || detail.price,
                    discountedPrice: detail.product?.discountedPrice || detail.price,
                };

                console.log("Created cartItem:", cartItem);

                // Thêm sản phẩm với số lượng ban đầu là 1, sau đó cập nhật số lượng
                addToCart(cartItem);

                // Nếu số lượng > 1, thêm các lần còn lại
                for (let i = 1; i < detail.quantity; i++) {
                    addToCart(cartItem);
                }

                addedCount++;
            });

            toast.success(
                `Đã thêm ${addedCount} loại sản phẩm (${order.orderDetails.reduce((sum, detail) => sum + detail.quantity, 0)} sản phẩm) vào giỏ hàng!`,
                {
                    position: "top-center",
                    autoClose: 3000,
                }
            );
        } catch (error) {
            console.error("Lỗi khi đặt lại đơn hàng:", error);
            toast.error("Có lỗi xảy ra khi đặt lại đơn hàng!");
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ReceiptPercentIcon className="w-5 h-5 text-blue-600" />
                Tóm tắt đơn hàng
            </h4>

            <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        Tạm tính ({order.orderDetails.length} sản phẩm):
                    </span>
                    <span className="font-medium text-gray-900">
                        {subtotal.toLocaleString()} VND
                    </span>
                </div>

                {/* Shipping Fee */}
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                        <TruckIcon className="w-4 h-4" />
                        Phí giao hàng:
                    </span>
                    <span className="font-medium text-gray-900">
                        {order.shippingFee?.toLocaleString() || '0'} VND
                    </span>
                </div>

                {/* Discount if any */}
                {order.discount && order.discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Giảm giá:</span>
                        <span className="font-medium text-green-600">
                            -{order.discount.toLocaleString()} VND
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-300 my-3"></div>

                {/* Total */}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                        Tổng tiền:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                        {order.totalPrice.toLocaleString()} VND
                    </span>
                </div>

                {/* Payment Status */}
                <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-gray-600">Trạng thái thanh toán:</span>
                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {order.paymentStatus === "PAID" ? "Đã thanh toán" :
                            order.paymentStatus === "PENDING" ? "Chờ thanh toán" :
                                order.paymentStatus === "FAILED" ? "Thanh toán thất bại" :
                                    order.paymentStatus}
                    </span>
                </div>

                {/* Payment Method */}
                {order.paymentMethod && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Phương thức thanh toán:</span>
                        <span className="font-medium text-gray-900">
                            {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" :
                                order.paymentMethod === "VNPAY" ? "VNPay" :
                                    order.paymentMethod === "MOMO" ? "MoMo" :
                                        order.paymentMethod}
                        </span>
                    </div>
                )}

                {/* Cancel Order Button */}
                {order.status === "PENDING" && (
                    <div className="pt-4 border-t border-gray-300">
                        <button
                            onClick={() => onCancelOrder(order.id)}
                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                        >
                            Hủy đơn hàng
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Bạn chỉ có thể hủy đơn hàng khi đơn hàng chưa được xác nhận
                        </p>
                    </div>
                )}

                {/* Order Actions */}
                {order.status === "COMPLETED" && (
                    <div className="pt-4 border-t border-gray-300">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowInvoiceModal(true)}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <PrinterIcon className="w-4 h-4" />
                                In hóa đơn
                            </button>
                            <button
                                onClick={handleReorder}
                                disabled={isReordering}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${isReordering ? 'animate-spin' : ''}`} />
                                {isReordering ? 'Đang xử lý...' : 'Đặt lại'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Print Modal */}
            <InvoicePrintModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                order={order}
            />
        </div>
    );
};

export default OrderSummary;
