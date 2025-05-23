import React, { useState } from 'react';
import { generateOrderBillPDF } from '../../utils/pdfGenerator';
import { toast } from 'react-toastify';

const ExportBillButton = ({
    order,
    variant = 'primary',
    size = 'small',
    className = '',
    disabled = false
}) => {
    const [isExporting, setIsExporting] = useState(false);

    // Kiểm tra xem đơn hàng có thể xuất hóa đơn không - chỉ cho đơn hàng đã xác nhận
    const canExportBill = (orderStatus) => {
        return orderStatus === 'CONFIRMED';
    };

    const handleExportBill = async () => {
        if (!order) {
            toast.error('Không tìm thấy thông tin đơn hàng');
            return;
        }

        if (!canExportBill(order.status)) {
            toast.warning('Chỉ có thể xuất hóa đơn cho đơn hàng đã xác nhận');
            return;
        }

        setIsExporting(true);

        try {
            // Hiển thị thông báo bắt đầu tạo PDF
            toast.info('Đang tạo hóa đơn PDF...', { autoClose: 2000 });

            // Tạo PDF
            const result = await generateOrderBillPDF(order);

            if (result.success) {
                toast.success(`Đã xuất hóa đơn thành công: ${result.fileName}`);
            } else {
                toast.error(`Lỗi tạo hóa đơn: ${result.error}`);
            }
        } catch (error) {
            console.error('Lỗi xuất hóa đơn:', error);
            toast.error('Có lỗi xảy ra khi tạo hóa đơn');
        } finally {
            setIsExporting(false);
        }
    };

    // Xác định style dựa trên variant và size
    const getButtonStyle = () => {
        let baseStyle = 'inline-flex items-center justify-center rounded transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        // Variant styles
        if (variant === 'primary') {
            baseStyle += ' bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500';
        } else if (variant === 'secondary') {
            baseStyle += ' bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500';
        } else if (variant === 'outline') {
            baseStyle += ' border border-orange-500 text-orange-500 hover:bg-orange-50 focus:ring-orange-500';
        }

        // Size styles
        if (size === 'small') {
            baseStyle += ' px-3 py-1 text-sm';
        } else if (size === 'medium') {
            baseStyle += ' px-4 py-2 text-base';
        } else if (size === 'large') {
            baseStyle += ' px-6 py-3 text-lg';
        }

        return baseStyle;
    };

    // Xác định text hiển thị
    const getButtonText = () => {
        if (isExporting) {
            return size === 'small' ? 'Đang tạo...' : 'Đang tạo hóa đơn...';
        }
        return size === 'small' ? 'Xuất HĐ' : 'Xuất hóa đơn';
    };

    // Kiểm tra xem có thể hiển thị nút không
    const shouldShowButton = canExportBill(order?.status);

    if (!shouldShowButton) {
        return null; // Không hiển thị nút nếu đơn hàng không thể xuất hóa đơn
    }

    return (
        <button
            onClick={handleExportBill}
            disabled={disabled || isExporting}
            className={`${getButtonStyle()} ${className}`}
            title="Xuất hóa đơn giao hàng PDF"
        >
            {isExporting ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    {getButtonText()}
                </>
            ) : (
                <>
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    {getButtonText()}
                </>
            )}
        </button>
    );
};

export default ExportBillButton;
