import React from "react";
import { 
    ClockIcon,
    CheckCircleIcon,
    TruckIcon,
    GiftIcon,
    XCircleIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const OrderStatusOverview = ({ orders, onStatusFilter, activeFilter }) => {
    // Tính toán số lượng đơn hàng theo trạng thái
    const statusCounts = {
        all: orders.length,
        PENDING: orders.filter(order => order.status === "PENDING").length,
        CONFIRMED: orders.filter(order => order.status === "CONFIRMED").length,
        SHIPPED: orders.filter(order => order.status === "SHIPPED").length,
        COMPLETED: orders.filter(order => order.status === "COMPLETED").length,
        CANCELLED: orders.filter(order => order.status === "CANCELLED").length,
    };

    // Tính tổng giá trị đơn hàng
    const totalValue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const statusItems = [
        {
            key: "all",
            label: "Tất cả",
            count: statusCounts.all,
            icon: CurrencyDollarIcon,
            color: "bg-gradient-to-r from-blue-500 to-blue-600",
            textColor: "text-blue-600",
            bgLight: "bg-blue-50",
            borderColor: "border-blue-200",
            description: "Tổng đơn hàng"
        },
        {
            key: "PENDING",
            label: "Chờ xử lý",
            count: statusCounts.PENDING,
            icon: ClockIcon,
            color: "bg-gradient-to-r from-yellow-500 to-orange-500",
            textColor: "text-yellow-600",
            bgLight: "bg-yellow-50",
            borderColor: "border-yellow-200",
            description: "Đang chờ xác nhận"
        },
        {
            key: "CONFIRMED",
            label: "Đã xác nhận",
            count: statusCounts.CONFIRMED,
            icon: CheckCircleIcon,
            color: "bg-gradient-to-r from-green-500 to-emerald-500",
            textColor: "text-green-600",
            bgLight: "bg-green-50",
            borderColor: "border-green-200",
            description: "Đã được xác nhận"
        },
        {
            key: "SHIPPED",
            label: "Đang giao",
            count: statusCounts.SHIPPED,
            icon: TruckIcon,
            color: "bg-gradient-to-r from-purple-500 to-indigo-500",
            textColor: "text-purple-600",
            bgLight: "bg-purple-50",
            borderColor: "border-purple-200",
            description: "Đang vận chuyển"
        },
        {
            key: "COMPLETED",
            label: "Hoàn thành",
            count: statusCounts.COMPLETED,
            icon: GiftIcon,
            color: "bg-gradient-to-r from-emerald-500 to-teal-500",
            textColor: "text-emerald-600",
            bgLight: "bg-emerald-50",
            borderColor: "border-emerald-200",
            description: "Đã giao thành công"
        },
        {
            key: "CANCELLED",
            label: "Đã hủy",
            count: statusCounts.CANCELLED,
            icon: XCircleIcon,
            color: "bg-gradient-to-r from-red-500 to-pink-500",
            textColor: "text-red-600",
            bgLight: "bg-red-50",
            borderColor: "border-red-200",
            description: "Đơn hàng bị hủy"
        }
    ];

    return (
        <div className="mb-8">
            {/* Header với tổng quan */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Tổng quan đơn hàng</h3>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Tổng giá trị</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {totalValue.toLocaleString()} VND
                        </p>
                    </div>
                </div>
                
                {/* Grid các trạng thái */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statusItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activeFilter === item.key;
                        
                        return (
                            <div
                                key={item.key}
                                onClick={() => onStatusFilter(item.key)}
                                className={`
                                    relative cursor-pointer rounded-xl p-4 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                                    ${isActive 
                                        ? `${item.bgLight} ${item.borderColor} border-2 shadow-md` 
                                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {/* Icon với gradient background */}
                                <div className={`
                                    w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-3 mx-auto
                                    ${isActive ? 'shadow-lg' : 'shadow-md'}
                                `}>
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                
                                {/* Số lượng */}
                                <div className="text-center">
                                    <p className={`text-2xl font-bold ${isActive ? item.textColor : 'text-gray-700'}`}>
                                        {item.count}
                                    </p>
                                    <p className={`text-sm font-medium ${isActive ? item.textColor : 'text-gray-600'}`}>
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.description}
                                    </p>
                                </div>
                                
                                {/* Active indicator */}
                                {isActive && (
                                    <div className={`absolute -top-1 -right-1 w-4 h-4 ${item.color} rounded-full border-2 border-white shadow-sm`}></div>
                                )}
                                
                                {/* Hover effect */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Đơn hàng hôm nay</p>
                            <p className="text-2xl font-bold">
                                {orders.filter(order => {
                                    const today = new Date();
                                    const orderDate = new Date(order.createdAt);
                                    return orderDate.toDateString() === today.toDateString();
                                }).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Đơn hoàn thành</p>
                            <p className="text-2xl font-bold">{statusCounts.COMPLETED}</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <GiftIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Tỷ lệ thành công</p>
                            <p className="text-2xl font-bold">
                                {orders.length > 0 ? Math.round((statusCounts.COMPLETED / orders.length) * 100) : 0}%
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusOverview;
