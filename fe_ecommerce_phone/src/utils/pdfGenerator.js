// Import thư viện theo cách ES6 modules
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Thông tin cửa hàng (có thể lấy từ config hoặc API)
const STORE_INFO = {
    name: "Cửa hàng điện thoại SonDV",
    address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
    phone: "0123-456-789",
    email: "contact@sondvphone.com",
    website: "www.sondvphone.com"
};

// Hàm format tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
};

// Hàm format ngày tháng
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Hàm chuyển đổi trạng thái đơn hàng
const getStatusText = (status) => {
    switch (status) {
        case "PENDING": return "Đang xử lý";
        case "CONFIRMED": return "Đã xác nhận";
        case "SHIPPED": return "Đang giao";
        case "COMPLETED": return "Đã giao";
        case "CANCELLED": return "Đã hủy";
        default: return status;
    }
};

// Hàm chuyển đổi phương thức thanh toán
const formatPaymentMethod = (method) => {
    switch (method) {
        case "COD": return "Thanh toán khi nhận hàng";
        case "VNPAY": return "Thanh toán qua VNPAY";
        case "MOMO": return "Thanh toán qua MOMO";
        default: return "Chưa có thông tin";
    }
};

// Hàm tạo QR code
const generateQRCode = async (text) => {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(text, {
            width: 100,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataURL;
    } catch (error) {
        console.error('Lỗi tạo QR code:', error);
        return null;
    }
};

// Hàm chính để tạo PDF hóa đơn
export const generateOrderBillPDF = async (orderData) => {
    try {
        // Tạo PDF mới với kích thước A4
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Thiết lập font và encoding để hỗ trợ tiếng Việt
        pdf.setFont('helvetica', 'normal');

        let yPosition = 20;
        const leftMargin = 15;
        const rightMargin = pageWidth - 15;
        const centerX = pageWidth / 2;

        // === HEADER - THÔNG TIN CỬA HÀNG ===
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('HOA DON GIAO HANG', centerX, yPosition, { align: 'center' });

        yPosition += 8;
        pdf.setFontSize(16);
        pdf.text('Cua hang dien thoai SonDV', centerX, yPosition, { align: 'center' });

        yPosition += 6;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('123 Duong Nguyen Van Cu, Quan 5, TP.HCM', centerX, yPosition, { align: 'center' });

        yPosition += 4;
        pdf.text('SDT: 0123-456-789 | Email: contact@sondvphone.com', centerX, yPosition, { align: 'center' });

        // Đường kẻ phân cách
        yPosition += 10;
        pdf.setLineWidth(0.5);
        pdf.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 10;

        // === THÔNG TIN ĐƠN HÀNG ===
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('THONG TIN DON HANG', leftMargin, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        // Thông tin đơn hàng - 2 cột với căn chỉnh đẹp hơn
        const col1X = leftMargin;
        const col2X = centerX + 5;

        pdf.text(`Ma don hang: #${orderData.id}`, col1X, yPosition);
        pdf.text(`Ngay dat: ${formatDate(orderData.createdAt)}`, col2X, yPosition);
        yPosition += 6;

        pdf.text(`Trang thai: ${getStatusText(orderData.status)}`, col1X, yPosition);
        pdf.text(`Thanh toan: ${formatPaymentMethod(orderData.paymentMethod)}`, col2X, yPosition);
        yPosition += 12;

        // === THÔNG TIN KHÁCH HÀNG ===
        pdf.setFont('helvetica', 'bold');
        pdf.text('THONG TIN KHACH HANG', leftMargin, yPosition);
        yPosition += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.text(`Ho ten: ${orderData.customer?.fullName || 'N/A'}`, leftMargin, yPosition);
        yPosition += 5;
        pdf.text(`Email: ${orderData.customer?.email || 'N/A'}`, leftMargin, yPosition);
        yPosition += 5;
        pdf.text(`SDT: ${orderData.shippingInfo?.phoneNumber || 'N/A'}`, leftMargin, yPosition);
        yPosition += 5;

        // Địa chỉ có thể dài, cần wrap text
        const addressText = `Dia chi: ${orderData.shippingInfo?.address || 'N/A'}`;
        const addressLines = pdf.splitTextToSize(addressText, rightMargin - leftMargin);
        pdf.text(addressLines, leftMargin, yPosition);
        yPosition += addressLines.length * 5 + 5;

        // === DANH SÁCH SẢN PHẨM ===
        pdf.setFont('helvetica', 'bold');
        pdf.text('DANH SACH SAN PHAM', leftMargin, yPosition);
        yPosition += 8;

        // Header bảng sản phẩm với căn chỉnh tốt hơn
        const tableStartY = yPosition;
        const tableWidth = rightMargin - leftMargin;
        const colWidths = {
            product: tableWidth * 0.5,    // 50% cho tên sản phẩm
            quantity: tableWidth * 0.1,   // 10% cho số lượng
            price: tableWidth * 0.2,      // 20% cho đơn giá
            total: tableWidth * 0.2       // 20% cho thành tiền
        };

        // Vẽ header bảng với background
        pdf.setFillColor(245, 245, 245);
        pdf.rect(leftMargin, yPosition - 2, tableWidth, 10, 'F');

        // Vẽ border cho header
        pdf.setLineWidth(0.3);
        pdf.rect(leftMargin, yPosition - 2, tableWidth, 10);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);

        let currentX = leftMargin;
        pdf.text('San pham', currentX + 2, yPosition + 4);
        currentX += colWidths.product;

        pdf.text('SL', currentX + 2, yPosition + 4);
        currentX += colWidths.quantity;

        pdf.text('Don gia', currentX + 2, yPosition + 4);
        currentX += colWidths.price;

        pdf.text('Thanh tien', currentX + 2, yPosition + 4);

        yPosition += 10;

        // Dữ liệu sản phẩm
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        let subtotal = 0;

        if (orderData.orderDetails && orderData.orderDetails.length > 0) {
            orderData.orderDetails.forEach((item, index) => {
                const itemTotal = item.quantity * item.price;
                subtotal += itemTotal;

                const rowHeight = 8;

                // Vẽ background cho dòng chẵn
                if (index % 2 === 0) {
                    pdf.setFillColor(250, 250, 250);
                    pdf.rect(leftMargin, yPosition, tableWidth, rowHeight, 'F');
                }

                currentX = leftMargin;

                // Tên sản phẩm (có thể xuống dòng nếu quá dài)
                const productName = item.productName || 'N/A';
                const maxWidth = colWidths.product - 4;
                const lines = pdf.splitTextToSize(productName, maxWidth);

                pdf.text(lines, currentX + 2, yPosition + 5);
                currentX += colWidths.product;

                // Căn giữa số lượng
                pdf.text(item.quantity.toString(), currentX + colWidths.quantity / 2, yPosition + 5, { align: 'center' });
                currentX += colWidths.quantity;

                // Căn phải giá tiền
                pdf.text(formatCurrency(item.price), currentX + colWidths.price - 2, yPosition + 5, { align: 'right' });
                currentX += colWidths.price;

                pdf.text(formatCurrency(itemTotal), currentX + colWidths.total - 2, yPosition + 5, { align: 'right' });

                // Vẽ border cho dòng
                pdf.setLineWidth(0.2);
                pdf.rect(leftMargin, yPosition, tableWidth, rowHeight);

                yPosition += rowHeight;
            });
        }

        yPosition += 8;

        // === TỔNG TIỀN ===
        const summaryStartX = centerX + 20;
        const summaryWidth = 60;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Vẽ box cho tổng tiền
        pdf.setLineWidth(0.3);
        pdf.rect(summaryStartX, yPosition - 5, summaryWidth, 25);

        pdf.text('Tam tinh:', summaryStartX + 2, yPosition);
        pdf.text(formatCurrency(subtotal), summaryStartX + summaryWidth - 2, yPosition, { align: 'right' });
        yPosition += 6;

        const shippingFee = orderData.shippingFee || 0;
        pdf.text('Phi van chuyen:', summaryStartX + 2, yPosition);
        pdf.text(formatCurrency(shippingFee), summaryStartX + summaryWidth - 2, yPosition, { align: 'right' });
        yPosition += 6;

        // Đường kẻ phân cách
        pdf.line(summaryStartX + 2, yPosition, summaryStartX + summaryWidth - 2, yPosition);
        yPosition += 4;

        pdf.setFont('helvetica', 'bold');
        pdf.text('TONG CONG:', summaryStartX + 2, yPosition);
        pdf.text(formatCurrency(orderData.totalPrice), summaryStartX + summaryWidth - 2, yPosition, { align: 'right' });
        yPosition += 15;

        // === THÔNG TIN VẬN CHUYỂN ===
        if (orderData.shippingInfo) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('THONG TIN VAN CHUYEN', leftMargin, yPosition);
            yPosition += 8;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(`Don vi van chuyen: ${orderData.shippingInfo.carrier || 'N/A'}`, leftMargin, yPosition);
            yPosition += 5;

            if (orderData.shippingInfo.trackingNumber) {
                pdf.text(`Ma van don: ${orderData.shippingInfo.trackingNumber}`, leftMargin, yPosition);
                yPosition += 5;
            }

            if (orderData.shippingInfo.estimatedDelivery) {
                pdf.text(`Du kien giao: ${formatDate(orderData.shippingInfo.estimatedDelivery)}`, leftMargin, yPosition);
                yPosition += 5;
            }
        }

        yPosition += 15;

        // === QR CODE VÀ CHỮ KÝ ===
        if (yPosition < pageHeight - 50) {
            // Layout 2 cột: QR code bên trái, chữ ký bên phải
            const qrX = leftMargin;
            const signatureX = centerX + 10;

            // Tạo QR code cho tracking
            const trackingInfo = `Don hang #${orderData.id} - ${orderData.shippingInfo?.trackingNumber || 'N/A'}`;
            const qrCodeDataURL = await generateQRCode(trackingInfo);

            if (qrCodeDataURL) {
                pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPosition, 30, 30);
                pdf.setFontSize(8);
                pdf.text('Scan de theo doi', qrX, yPosition + 35, { align: 'left' });
            }

            // Chữ ký người nhận
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Chu ky nguoi nhan:', signatureX, yPosition + 5);

            // Vẽ khung chữ ký
            pdf.setLineWidth(0.3);
            pdf.rect(signatureX, yPosition + 8, 60, 20);

            yPosition += 40;
        }

        // === FOOTER ===
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Cam on quy khach da mua hang!', centerX, yPosition, { align: 'center' });

        yPosition += 5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Hotline: 0123-456-789 | Website: www.sondvphone.com', centerX, yPosition, { align: 'center' });

        // Lưu PDF
        const fileName = `hoa-don-${orderData.id}-${new Date().getTime()}.pdf`;
        pdf.save(fileName);

        return { success: true, fileName };

    } catch (error) {
        console.error('Lỗi tạo PDF:', error);
        return { success: false, error: error.message };
    }
};
