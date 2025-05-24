import React, { useRef } from "react";
import {
    XMarkIcon,
    PrinterIcon,
    BuildingStorefrontIcon,
    PhoneIcon,
    MapPinIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";

const InvoicePrintModal = ({ isOpen, onClose, order }) => {
    const printRef = useRef();

    if (!isOpen || !order) return null;

    const handlePrint = () => {
        const printContent = printRef.current;
        const originalContents = document.body.innerHTML;

        // Create print-specific styles
        const printStyles = `
            <style>
                @media print {
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
                    .print-container { max-width: 210mm; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #000; margin-bottom: 10px; }
                    .company-info { font-size: 11px; color: #666; }
                    .invoice-title { font-size: 20px; font-weight: bold; margin: 20px 0; text-align: center; }
                    .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .order-info div { flex: 1; }
                    .customer-info { margin-bottom: 20px; }
                    .products-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .products-table th, .products-table td { border: 1px solid #ddd; padding: 10px; vertical-align: middle; }
                    .products-table th { background-color: #f5f5f5; font-weight: bold; text-align: center; }
                    .products-table .col-stt { width: 8%; text-align: center; }
                    .products-table .col-name { width: 40%; text-align: left; }
                    .products-table .col-quantity { width: 12%; text-align: center; }
                    .products-table .col-price { width: 20%; text-align: right; }
                    .products-table .col-total { width: 20%; text-align: right; }
                    .products-table td.text-center { text-align: center; }
                    .products-table td.text-right { text-align: right; }
                    .products-table td.text-left { text-align: left; }
                    .total-section { margin-top: 20px; margin-left: auto; width: 50%; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; border-bottom: 1px dotted #ccc; }
                    .total-row:last-child { border-bottom: none; }
                    .total-final { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; background-color: #f9f9f9; padding: 10px; }
                    .total-label { font-weight: 500; }
                    .total-value { font-weight: 600; }
                    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
                    .no-print { display: none !important; }
                }
            </style>
        `;

        document.body.innerHTML = printStyles + printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore original content
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const subtotal = order.orderDetails.reduce((sum, detail) =>
        sum + (detail.price * detail.quantity), 0
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b no-print">
                    <h2 className="text-xl font-semibold text-gray-900">Hóa đơn đơn hàng #{order.id}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            In hóa đơn
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div ref={printRef} className="print-container p-6">
                    {/* Company Header */}
                    <div className="header">
                        <div className="company-name flex items-center justify-center gap-2">
                            <BuildingStorefrontIcon className="w-8 h-8" />
                            PHONE STORE
                        </div>
                        <div className="company-info space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <MapPinIcon className="w-4 h-4" />
                                123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                            </div>
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-1">
                                    <PhoneIcon className="w-4 h-4" />
                                    0123-456-789
                                </div>
                                <div className="flex items-center gap-1">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    info@phonestore.com
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Title */}
                    <div className="invoice-title">HÓA ĐƠN BÁN HÀNG</div>

                    {/* Order Information */}
                    <div className="order-info">
                        <div>
                            <p><strong>Số hóa đơn:</strong> #{order.id}</p>
                            <p><strong>Ngày đặt:</strong> {formatDate(order.createdAt)}</p>
                            <p><strong>Trạng thái:</strong> {
                                order.status === "COMPLETED" ? "Hoàn thành" :
                                    order.status === "SHIPPED" ? "Đang giao" :
                                        order.status === "CONFIRMED" ? "Đã xác nhận" :
                                            order.status === "PENDING" ? "Chờ xác nhận" : order.status
                            }</p>
                        </div>
                        <div>
                            <p><strong>Phương thức thanh toán:</strong> {
                                order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" :
                                    order.paymentMethod === "VNPAY" ? "VNPay" :
                                        order.paymentMethod === "MOMO" ? "MoMo" : order.paymentMethod
                            }</p>
                            <p><strong>Trạng thái thanh toán:</strong> {
                                order.paymentStatus === "PAID" ? "Đã thanh toán" :
                                    order.paymentStatus === "PENDING" ? "Chờ thanh toán" :
                                        order.paymentStatus === "FAILED" ? "Thanh toán thất bại" : order.paymentStatus
                            }</p>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="customer-info">
                        <h3 className="font-semibold mb-2">THÔNG TIN KHÁCH HÀNG:</h3>
                        <p><strong>Họ tên:</strong> {order.customer?.fullName || 'N/A'}</p>
                        <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
                        <p><strong>Số điện thoại:</strong> {order.shippingInfo?.phoneNumber || 'N/A'}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> {order.shippingInfo?.address || 'N/A'}</p>
                    </div>

                    {/* Products Table */}
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th className="col-stt">STT</th>
                                <th className="col-name">Tên sản phẩm</th>
                                <th className="col-quantity">Số lượng</th>
                                <th className="col-price">Đơn giá</th>
                                <th className="col-total">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderDetails.map((detail, index) => (
                                <tr key={detail.id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-left">{detail.productName}</td>
                                    <td className="text-center">{detail.quantity}</td>
                                    <td className="text-right">{detail.price.toLocaleString()} VND</td>
                                    <td className="text-right">{(detail.price * detail.quantity).toLocaleString()} VND</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total Section */}
                    <div className="total-section">
                        <div className="total-row">
                            <span className="total-label">Tạm tính:</span>
                            <span className="total-value">{subtotal.toLocaleString()} VND</span>
                        </div>
                        <div className="total-row">
                            <span className="total-label">Phí giao hàng:</span>
                            <span className="total-value">{(order.shippingFee || 0).toLocaleString()} VND</span>
                        </div>
                        {order.discount && order.discount > 0 && (
                            <div className="total-row">
                                <span className="total-label">Giảm giá:</span>
                                <span className="total-value" style={{ color: '#e74c3c' }}>-{order.discount.toLocaleString()} VND</span>
                            </div>
                        )}
                        <div className="total-final">
                            <div className="total-row">
                                <span className="total-label">TỔNG CỘNG:</span>
                                <span className="total-value" style={{ fontSize: '18px', color: '#2c3e50' }}>{order.totalPrice.toLocaleString()} VND</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        <p>Cảm ơn quý khách đã mua hàng tại Phone Store!</p>
                        <p>Mọi thắc mắc xin liên hệ: 0123-456-789 hoặc info@phonestore.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePrintModal;
