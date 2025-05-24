import React from "react";
import { 
    ClockIcon, 
    CheckCircleIcon, 
    TruckIcon, 
    GiftIcon,
    XCircleIcon 
} from "@heroicons/react/24/solid";

const OrderStatusBadge = ({ status, showIcon = true, size = "md" }) => {
    const statusConfig = {
        PENDING: {
            label: "Chờ xác nhận",
            icon: ClockIcon,
            className: "bg-yellow-100 text-yellow-800 border-yellow-200",
            iconColor: "text-yellow-600"
        },
        CONFIRMED: {
            label: "Đã xác nhận",
            icon: CheckCircleIcon,
            className: "bg-purple-100 text-purple-800 border-purple-200",
            iconColor: "text-purple-600"
        },
        SHIPPED: {
            label: "Đang giao",
            icon: TruckIcon,
            className: "bg-blue-100 text-blue-800 border-blue-200",
            iconColor: "text-blue-600"
        },
        COMPLETED: {
            label: "Hoàn thành",
            icon: GiftIcon,
            className: "bg-green-100 text-green-800 border-green-200",
            iconColor: "text-green-600"
        },
        CANCELLED: {
            label: "Đã hủy",
            icon: XCircleIcon,
            className: "bg-red-100 text-red-800 border-red-200",
            iconColor: "text-red-600"
        }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const IconComponent = config.icon;

    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4", 
        lg: "w-5 h-5"
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 rounded-full font-medium border
            ${config.className} ${sizeClasses[size]}
        `}>
            {showIcon && (
                <IconComponent className={`${iconSizes[size]} ${config.iconColor}`} />
            )}
            {config.label}
        </span>
    );
};

export default OrderStatusBadge;
