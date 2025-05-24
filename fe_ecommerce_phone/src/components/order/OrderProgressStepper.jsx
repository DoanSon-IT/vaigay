import React from "react";
import { 
    ClockIcon, 
    CheckCircleIcon, 
    TruckIcon, 
    GiftIcon,
    XCircleIcon 
} from "@heroicons/react/24/outline";
import { 
    CheckCircleIcon as CheckCircleIconSolid,
    ClockIcon as ClockIconSolid,
    TruckIcon as TruckIconSolid,
    GiftIcon as GiftIconSolid,
    XCircleIcon as XCircleIconSolid
} from "@heroicons/react/24/solid";

const OrderProgressStepper = ({ 
    currentStatus, 
    createdAt, 
    showEstimatedTime = true,
    trackingNumber = null,
    className = "" 
}) => {
    // Định nghĩa các bước và thông tin
    const steps = [
        {
            key: "PENDING",
            label: "Chờ xác nhận",
            description: "Đơn hàng đang chờ xác nhận",
            icon: ClockIcon,
            iconSolid: ClockIconSolid,
            estimatedDays: 0,
            color: {
                active: "text-yellow-600 bg-yellow-100 border-yellow-300",
                completed: "text-green-600 bg-green-100 border-green-300",
                inactive: "text-gray-400 bg-gray-100 border-gray-300"
            }
        },
        {
            key: "CONFIRMED",
            label: "Đã xác nhận",
            description: "Đơn hàng đã được xác nhận và chuẩn bị",
            icon: CheckCircleIcon,
            iconSolid: CheckCircleIconSolid,
            estimatedDays: 1,
            color: {
                active: "text-purple-600 bg-purple-100 border-purple-300",
                completed: "text-green-600 bg-green-100 border-green-300",
                inactive: "text-gray-400 bg-gray-100 border-gray-300"
            }
        },
        {
            key: "SHIPPED",
            label: "Đang giao",
            description: "Đơn hàng đang được vận chuyển",
            icon: TruckIcon,
            iconSolid: TruckIconSolid,
            estimatedDays: 3,
            color: {
                active: "text-blue-600 bg-blue-100 border-blue-300",
                completed: "text-green-600 bg-green-100 border-green-300",
                inactive: "text-gray-400 bg-gray-100 border-gray-300"
            }
        },
        {
            key: "COMPLETED",
            label: "Hoàn thành",
            description: "Đơn hàng đã được giao thành công",
            icon: GiftIcon,
            iconSolid: GiftIconSolid,
            estimatedDays: 0,
            color: {
                active: "text-green-600 bg-green-100 border-green-300",
                completed: "text-green-600 bg-green-100 border-green-300",
                inactive: "text-gray-400 bg-gray-100 border-gray-300"
            }
        }
    ];

    // Xử lý trường hợp đơn hàng bị hủy
    if (currentStatus === "CANCELLED") {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <XCircleIconSolid className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-red-800">Đơn hàng đã bị hủy</h3>
                        <p className="text-sm text-red-600">
                            Đơn hàng này đã được hủy và không thể tiếp tục xử lý.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Tìm index của trạng thái hiện tại
    const currentStepIndex = steps.findIndex(step => step.key === currentStatus);
    
    // Tính toán thời gian ước tính
    const getEstimatedDate = (daysToAdd) => {
        if (!showEstimatedTime || !createdAt) return null;
        const date = new Date(createdAt);
        date.setDate(date.getDate() + daysToAdd);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Xác định trạng thái của từng bước
    const getStepStatus = (stepIndex) => {
        if (stepIndex < currentStepIndex) return "completed";
        if (stepIndex === currentStepIndex) return "active";
        return "inactive";
    };

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Trạng thái đơn hàng</h3>
                {trackingNumber && (
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">Mã vận đơn:</span> {trackingNumber}
                    </div>
                )}
            </div>

            {/* Progress Steps */}
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                    <div 
                        className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                        style={{ 
                            width: currentStepIndex >= 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' 
                        }}
                    />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const status = getStepStatus(index);
                        const IconComponent = status === "completed" ? step.iconSolid : step.icon;
                        const estimatedDate = getEstimatedDate(step.estimatedDays);

                        return (
                            <div key={step.key} className="flex flex-col items-center group">
                                {/* Step Icon */}
                                <div 
                                    className={`
                                        relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 
                                        transition-all duration-300 transform group-hover:scale-110
                                        ${step.color[status]}
                                        ${status === "active" ? "animate-pulse" : ""}
                                    `}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </div>

                                {/* Step Content */}
                                <div className="mt-3 text-center max-w-24">
                                    <div className={`
                                        text-sm font-medium transition-colors duration-300
                                        ${status === "completed" ? "text-green-600" : 
                                          status === "active" ? "text-gray-900" : "text-gray-500"}
                                    `}>
                                        {step.label}
                                    </div>
                                    
                                    {/* Estimated Time */}
                                    {showEstimatedTime && estimatedDate && status !== "inactive" && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {status === "completed" ? "Đã hoàn thành" : estimatedDate}
                                        </div>
                                    )}
                                </div>

                                {/* Tooltip on Hover */}
                                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 whitespace-nowrap">
                                    {step.description}
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Current Status Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        {(() => {
                            const currentStep = steps.find(step => step.key === currentStatus);
                            const IconComponent = currentStep?.iconSolid || ClockIconSolid;
                            return <IconComponent className="h-6 w-6 text-blue-600" />;
                        })()}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">
                            Trạng thái hiện tại: {steps.find(step => step.key === currentStatus)?.label}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {steps.find(step => step.key === currentStatus)?.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderProgressStepper;
