// Dữ liệu đơn hàng mẫu để test tính năng xuất hóa đơn
export const sampleOrderData = {
    id: 12345,
    status: "CONFIRMED",
    createdAt: "2024-01-15T10:30:00Z",
    totalPrice: 25430000,
    shippingFee: 30000,
    paymentMethod: "VNPAY",
    paymentStatus: "PAID",
    note: "Giao hàng trong giờ hành chính",
    
    customer: {
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@email.com"
    },
    
    shippingInfo: {
        address: "123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP.HCM",
        phoneNumber: "0123456789",
        carrier: "Giao hàng nhanh",
        trackingNumber: "GHN123456789",
        estimatedDelivery: "2024-01-17T15:00:00Z",
        shippingFee: 30000
    },
    
    orderDetails: [
        {
            id: 1,
            productId: 101,
            productName: "iPhone 15 Pro Max 256GB - Titan Tự Nhiên",
            productImage: "/images/iphone15pro.jpg",
            quantity: 1,
            price: 25000000
        },
        {
            id: 2,
            productId: 102,
            productName: "Ốp lưng iPhone 15 Pro Max Silicone",
            productImage: "/images/case-iphone.jpg",
            quantity: 2,
            price: 200000
        }
    ]
};

// Hàm để tạo dữ liệu đơn hàng ngẫu nhiên cho test
export const generateRandomOrderData = () => {
    const statuses = ["CONFIRMED", "SHIPPED", "COMPLETED"];
    const paymentMethods = ["VNPAY", "MOMO", "COD"];
    const carriers = ["Giao hàng nhanh", "Viettel Post", "J&T Express"];
    
    const products = [
        { name: "iPhone 15 Pro Max", price: 25000000 },
        { name: "Samsung Galaxy S24 Ultra", price: 22000000 },
        { name: "Xiaomi 14 Pro", price: 15000000 },
        { name: "Ốp lưng Silicon", price: 200000 },
        { name: "Cáp sạc Type-C", price: 150000 },
        { name: "Tai nghe AirPods", price: 3500000 }
    ];
    
    const randomId = Math.floor(Math.random() * 100000) + 1000;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    
    // Tạo danh sách sản phẩm ngẫu nhiên
    const numProducts = Math.floor(Math.random() * 3) + 1; // 1-3 sản phẩm
    const orderDetails = [];
    let totalPrice = 0;
    
    for (let i = 0; i < numProducts; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 số lượng
        const itemTotal = product.price * quantity;
        totalPrice += itemTotal;
        
        orderDetails.push({
            id: i + 1,
            productId: 100 + i,
            productName: product.name,
            productImage: `/images/product-${i + 1}.jpg`,
            quantity: quantity,
            price: product.price
        });
    }
    
    const shippingFee = 30000;
    totalPrice += shippingFee;
    
    return {
        id: randomId,
        status: randomStatus,
        createdAt: new Date().toISOString(),
        totalPrice: totalPrice,
        shippingFee: shippingFee,
        paymentMethod: randomPayment,
        paymentStatus: "PAID",
        note: "Đơn hàng test",
        
        customer: {
            fullName: `Khách hàng ${randomId}`,
            email: `customer${randomId}@email.com`
        },
        
        shippingInfo: {
            address: `${randomId} Đường Test, Quận 1, TP.HCM`,
            phoneNumber: `012345${String(randomId).slice(-4)}`,
            carrier: randomCarrier,
            trackingNumber: `${randomCarrier.slice(0, 3).toUpperCase()}${randomId}`,
            estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            shippingFee: shippingFee
        },
        
        orderDetails: orderDetails
    };
};
