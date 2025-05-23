import React, { useState, useEffect, useContext, useCallback } from "react";
import apiOrder from "../../api/apiOrder";
import apiInventory from "../../api/apiInventory";
import AppContext from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debounce } from 'lodash';
import ExportBillButton from "../../components/admin/ExportBillButton";

const OrderManagement = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Phân trang và lọc
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);
    const [sortField, setSortField] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");

    // Auto-refresh
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);

    // Bộ lọc
    const [filters, setFilters] = useState({
        status: "",
        paymentStatus: "",
        customerName: "",
        startDate: "",
        endDate: "",
        orderId: ""
    });

    // Định nghĩa fetchOrders trước
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            // Chuẩn bị tham số truy vấn
            const queryParams = {
                page: currentPage,
                size: pageSize,
                sort: sortField,
                direction: sortDirection,
                ...filters
            };

            const response = await apiOrder.getPaginatedOrders(queryParams);
            console.log("📦 Orders response:", response);
            console.log("📦 First order payment:", response.content?.[0]?.payment);
            console.log("📦 Payment status mapping:", response.content?.map(order => ({
                orderId: order.id,
                paymentMethod: order.payment?.paymentMethod,
                paymentStatus: order.payment?.status,
                transactionId: order.payment?.transactionId
            })));
            setOrders(response.content);
            setTotalPages(response.totalPages);
            setTotalOrders(response.totalElements);

        } catch (err) {
            setError(err.message);
            toast.error("Không thể tải danh sách đơn hàng: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, sortField, sortDirection, filters]);

    // Debounce tìm kiếm để tránh gọi API liên tục - giảm thời gian để phản hồi nhanh hơn
    const debouncedFetchOrders = useCallback(
        debounce(() => {
            fetchOrders();
        }, 300),
        [fetchOrders]
    );

    useEffect(() => {
        if (!auth) {
            navigate("/auth/login");
        } else {
            debouncedFetchOrders();
        }
    }, [auth, navigate, currentPage, pageSize, sortField, sortDirection, debouncedFetchOrders]);

    // Auto-refresh effect - chỉ refresh khi không có thao tác đang diễn ra
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Chỉ refresh khi không có thao tác đang diễn ra
                if (!isLoading && !isUpdatingStatus) {
                    fetchOrders();
                }
            }, 30000); // Refresh mỗi 30 giây
            setRefreshInterval(interval);
            return () => clearInterval(interval);
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
    }, [autoRefresh, fetchOrders, isLoading, isUpdatingStatus]);

    const formatPaymentMethod = (method) => {
        switch (method) {
            case "COD": return "Thanh toán khi nhận hàng";
            case "VNPAY": return "Thanh toán qua VNPAY";
            case "MOMO": return "Thanh toán qua MOMO";
            default: return "Chưa có thông tin";
        }
    };

    // Hàm format payment status
    const getPaymentStatusText = (status) => {
        switch (status) {
            case "PENDING": return "Chờ thanh toán";
            case "PROCESSING": return "Đang xử lý";
            case "PAID": return "Đã thanh toán";
            case "AWAITING_DELIVERY": return "Chờ giao hàng";
            case "FAILED": return "Thất bại";
            case "CANCELLED": return "Đã hủy";
            default: return status || "N/A";
        }
    };

    // Hàm lấy màu cho payment status
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "PAID": return "bg-green-100 text-green-800 border-green-200";
            case "AWAITING_DELIVERY": return "bg-blue-100 text-blue-800 border-blue-200";
            case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "PROCESSING": return "bg-purple-100 text-purple-800 border-purple-200";
            case "FAILED": return "bg-red-100 text-red-800 border-red-200";
            case "CANCELLED": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc"); // Mặc định là giảm dần khi chọn trường mới
        }
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            status: "",
            paymentStatus: "",
            customerName: "",
            startDate: "",
            endDate: "",
            orderId: ""
        });
        setCurrentPage(1);
    };

    const handleViewDetails = async (orderId) => {
        try {
            const order = await apiOrder.getOrderById(orderId);
            setSelectedOrder(order);
            setIsModalOpen(true);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        // Optimistic update - cập nhật UI ngay lập tức
        const previousOrders = [...orders];
        const previousSelectedOrder = selectedOrder;

        // Cập nhật UI ngay lập tức để người dùng thấy phản hồi nhanh
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));

        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }

        try {
            setIsUpdatingStatus(true);
            const response = await apiOrder.updateOrderStatus(orderId, newStatus);
            if (!response || !response.orderDetails) {
                throw new Error("Dữ liệu phản hồi không hợp lệ");
            }

            if (newStatus === "CANCELLED") {
                await Promise.all(
                    response.orderDetails.map(async (detail) => {
                        await apiInventory.adjustInventory(detail.product.id, detail.quantity, "Hoàn hàng do hủy đơn");
                    })
                );
            }

            // Refetch data để đảm bảo dữ liệu chính xác từ server
            await fetchOrders();
            toast.success("Cập nhật trạng thái thành công!");

            // Cập nhật selectedOrder với dữ liệu mới nhất
            if (selectedOrder && selectedOrder.id === orderId) {
                try {
                    const updatedOrder = await apiOrder.getOrderById(orderId);
                    setSelectedOrder(updatedOrder);
                } catch (err) {
                    console.error("Lỗi khi cập nhật chi tiết đơn hàng:", err);
                }
            }
        } catch (err) {
            // Rollback optimistic update nếu có lỗi
            setOrders(previousOrders);
            if (previousSelectedOrder) {
                setSelectedOrder(previousSelectedOrder);
            }
            toast.error(err.message || "Lỗi khi cập nhật trạng thái");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        const orderToDelete = orders.find((order) => order.id === orderId);
        if (orderToDelete.status !== "CANCELLED") {
            toast.warn("Chỉ có thể xóa đơn hàng đã hủy!");
            return;
        }
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
            try {
                await apiOrder.deleteOrder(orderId);

                // Cập nhật lại danh sách sau khi xóa
                fetchOrders();

                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(null);
                    setIsModalOpen(false);
                }
                toast.success("Xóa đơn hàng thành công!");
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            }
        }
    };

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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(1); // Reset về trang đầu khi thay đổi kích thước trang
    };

    // Tính toán số lượng đơn hàng đang hiển thị
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalOrders);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Quản lý đơn hàng</h2>

            {/* Khu vực bộ lọc */}
            <div className="bg-white p-4 mb-6 rounded-lg shadow-md">
                {/* Auto-refresh toggle */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Bộ lọc đơn hàng</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Tự động làm mới (30s):</span>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? 'bg-green-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <button
                            onClick={fetchOrders}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            title="Làm mới ngay"
                        >
                            🔄
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn hàng</label>
                        <input
                            type="text"
                            name="orderId"
                            value={filters.orderId}
                            onChange={handleFilterChange}
                            placeholder="Nhập mã đơn hàng"
                            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                        <input
                            type="text"
                            name="customerName"
                            value={filters.customerName}
                            onChange={handleFilterChange}
                            placeholder="Nhập tên khách hàng"
                            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn hàng</label>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">Đang xử lý</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="SHIPPED">Đang giao</option>
                            <option value="COMPLETED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                        <select
                            name="paymentStatus"
                            value={filters.paymentStatus}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Tất cả thanh toán</option>
                            <option value="PENDING">Chờ thanh toán</option>
                            <option value="PROCESSING">Đang xử lý</option>
                            <option value="PAID">Đã thanh toán</option>
                            <option value="AWAITING_DELIVERY">Chờ giao hàng</option>
                            <option value="FAILED">Thất bại</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-2"
                    >
                        Xóa bộ lọc
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                    <button
                        className="float-right"
                        onClick={() => setError("")}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Thông báo đang cập nhật trạng thái */}
            {isUpdatingStatus && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
                    Đang cập nhật trạng thái đơn hàng...
                </div>
            )}

            {/* Thông tin phân trang */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <div className="mb-2 sm:mb-0">
                    <span className="text-gray-600">
                        Hiển thị {orders.length ? startItem : 0}-{endItem} trên {totalOrders} đơn hàng
                    </span>
                </div>
                <div className="flex items-center">
                    <span className="mr-2 text-gray-600">Số dòng mỗi trang:</span>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="mr-4 p-1 border rounded-md"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort("id")}
                                >
                                    <div className="flex items-center">
                                        Mã đơn hàng
                                        {sortField === "id" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-3 text-left">Khách hàng</th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort("createdAt")}
                                >
                                    <div className="flex items-center">
                                        Ngày đặt
                                        {sortField === "createdAt" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort("totalPrice")}
                                >
                                    <div className="flex items-center">
                                        Tổng tiền
                                        {sortField === "totalPrice" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center">
                                        Trạng thái đơn hàng
                                        {sortField === "status" && (
                                            <span className="ml-1">
                                                {sortDirection === "asc" ? "↑" : "↓"}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="p-3 text-left">Thanh toán</th>
                                <th className="p-3 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-medium">#{order.id}</td>
                                        <td className="p-3">
                                            <div>{order.customer?.fullName || "N/A"}</div>
                                            <div className="text-xs text-gray-500">{order.customer?.email || ""}</div>
                                        </td>
                                        <td className="p-3">
                                            <div>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                            <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</div>
                                        </td>
                                        <td className="p-3 font-medium">{order.totalPrice.toLocaleString()} VND</td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm ${order.status === "COMPLETED"
                                                    ? "bg-green-100 text-green-800"
                                                    : order.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : order.status === "CONFIRMED"
                                                            ? "bg-purple-100 text-purple-800"
                                                            : order.status === "SHIPPED"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="space-y-1">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs border ${getPaymentStatusColor(order.payment?.status)}`}
                                                >
                                                    {getPaymentStatusText(order.payment?.status)}
                                                </span>
                                                <div className="text-xs text-gray-500">
                                                    {formatPaymentMethod(order.payment?.paymentMethod)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center space-x-2 flex-wrap gap-1">
                                                <button
                                                    onClick={() => handleViewDetails(order.id)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    Chi tiết
                                                </button>

                                                <div className="relative group">
                                                    <button
                                                        className={`px-3 py-1 text-white rounded transition-colors ${isUpdatingStatus
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-green-500 hover:bg-green-600"
                                                            }`}
                                                        title="Cập nhật trạng thái"
                                                        disabled={isUpdatingStatus}
                                                    >
                                                        {isUpdatingStatus ? "Đang cập nhật..." : "Trạng thái"}
                                                    </button>

                                                    {/* Pseudo element giữ hover không bị nhảy */}
                                                    <div className="absolute top-full left-0 w-full h-2 bg-transparent pointer-events-none"></div>

                                                    {/* Dropdown */}
                                                    <div className={`absolute z-10 right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg border ${isUpdatingStatus ? "hidden" : "hidden group-hover:block"
                                                        }`}>
                                                        <div className="py-1">
                                                            {["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"].map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleUpdateStatus(order.id, status)}
                                                                    className={`block px-4 py-2 text-sm w-full text-center ${isUpdatingStatus
                                                                        ? "text-gray-400 cursor-not-allowed"
                                                                        : "text-gray-700 hover:bg-gray-100"
                                                                        }`}
                                                                    disabled={isUpdatingStatus}
                                                                >
                                                                    {getStatusText(status)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Nút xuất hóa đơn */}
                                                <ExportBillButton
                                                    order={order}
                                                    variant="primary"
                                                    size="small"
                                                />

                                                <button
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                    title="Xóa đơn hàng"
                                                    disabled={order.status !== "CANCELLED"}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-5 text-center text-gray-500">
                                        Không tìm thấy đơn hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${currentPage === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            «
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded ${currentPage === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            ‹
                        </button>

                        {/* Các nút trang */}
                        {[...Array(totalPages).keys()].map((page) => {
                            const pageNumber = page + 1;
                            // Hiển thị các trang ở gần trang hiện tại
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded ${currentPage === pageNumber
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            }
                            // Hiển thị dấu ... để thể hiện có các trang bị bỏ qua
                            else if (
                                (pageNumber === currentPage - 2 && pageNumber > 1) ||
                                (pageNumber === currentPage + 2 && pageNumber < totalPages)
                            ) {
                                return <span key={pageNumber}>...</span>;
                            }
                            return null;
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${currentPage === totalPages
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            ›
                        </button>
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded ${currentPage === totalPages
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Chi tiết đơn hàng */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Thông tin đơn hàng</h4>
                                <div className="space-y-2">
                                    <p>
                                        <span className="font-medium">Trạng thái:</span>
                                        <span
                                            className={`ml-2 px-2 py-1 rounded-full text-sm ${selectedOrder.status === "COMPLETED"
                                                ? "bg-green-100 text-green-800"
                                                : selectedOrder.status === "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : selectedOrder.status === "CONFIRMED"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : selectedOrder.status === "SHIPPED"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {getStatusText(selectedOrder.status)}
                                        </span>
                                    </p>
                                    <p><span className="font-medium">Ngày đặt:</span> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                                    <p><span className="font-medium">Tổng tiền:</span> <span className="font-medium text-green-600">{selectedOrder.totalPrice.toLocaleString()} VND</span></p>
                                    <p>
                                        <span className="font-medium">Thanh toán:</span>
                                        <span
                                            className={`ml-2 px-2 py-1 rounded-full text-xs border ${getPaymentStatusColor(selectedOrder.payment?.status)}`}
                                        >
                                            {getPaymentStatusText(selectedOrder.payment?.status)}
                                        </span>
                                    </p>
                                    <p><span className="font-medium">Phương thức:</span> {formatPaymentMethod(selectedOrder.payment?.paymentMethod)}</p>
                                    {selectedOrder.payment?.transactionId && (
                                        <p><span className="font-medium">Mã giao dịch:</span> {selectedOrder.payment.transactionId}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-700 mb-2">Thông tin khách hàng</h4>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Họ tên:</span> {selectedOrder.customer?.fullName || "N/A"}</p>
                                    <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || "N/A"}</p>
                                    <p><span className="font-medium">Số điện thoại:</span> {selectedOrder.shippingInfo?.phoneNumber || "Chưa có thông tin"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h4 className="font-medium text-gray-700 mb-2">Thông tin giao hàng</h4>
                            <div className="space-y-2">
                                <p><span className="font-medium">Địa chỉ giao hàng:</span> {selectedOrder.shippingInfo?.address || "Chưa có thông tin"}</p>
                                <p><span className="font-medium">Đơn vị vận chuyển:</span> {selectedOrder.shippingInfo?.carrier || "Chưa có thông tin"}</p>
                                <p><span className="font-medium">Ghi chú:</span> {selectedOrder.note || "Không có ghi chú"}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="font-medium text-gray-700 mb-3">Danh sách sản phẩm</h4>
                            <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sản phẩm</th>
                                            <th className="px-4 py-2 text-center textscaled-sm font-medium text-gray-600">Số lượng</th>
                                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Đơn giá</th>
                                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedOrder?.orderDetails?.length > 0 ? (
                                            selectedOrder.orderDetails.map((detail) => (
                                                <tr key={detail.id} className="hover:bg-gray-100">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={detail.productImage || "/placeholder-image.jpg"}
                                                                alt={detail.productName || "Sản phẩm"}
                                                                className="w-12 h-12 object-cover rounded border"
                                                                onError={(e) => {
                                                                    e.target.src = "/placeholder-image.jpg";
                                                                }}
                                                            />
                                                            <div className="ml-3">
                                                                <p className="font-medium">{detail.productName || "N/A"}</p>
                                                                <p className="text-xs text-gray-500">Mã SP: {detail.productId || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{detail.quantity || 0}</td>
                                                    <td className="px-4 py-3 text-right">{detail.price ? detail.price.toLocaleString() : "0"} VND</td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {(detail.quantity && detail.price) ? (detail.quantity * detail.price).toLocaleString() : "0"} VND
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                                                    Không có sản phẩm trong đơn hàng
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right font-medium">Tổng giá trị:</td>
                                            <td className="px-4 py-3 text-right font-medium text-green-600">{selectedOrder.totalPrice.toLocaleString()} VND</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <div className="flex space-x-2 flex-wrap gap-2">
                                <button
                                    onClick={() => {
                                        if (selectedOrder.status === "CANCELLED") {
                                            toast.warn("Đơn hàng đã hủy không thể cập nhật trạng thái!");
                                            return;
                                        }
                                        handleUpdateStatus(selectedOrder.id, "PENDING");
                                    }}
                                    className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={selectedOrder.status === "CANCELLED"}
                                    title={selectedOrder.status === "CANCELLED" ? "Đơn hàng đã hủy không thể cập nhật trạng thái" : ""}
                                >
                                    Đang xử lý
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedOrder.status === "CANCELLED") {
                                            toast.warn("Đơn hàng đã hủy không thể cập nhật trạng thái!");
                                            return;
                                        }
                                        handleUpdateStatus(selectedOrder.id, "CONFIRMED");
                                    }}
                                    className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={selectedOrder.status === "CANCELLED"}
                                    title={selectedOrder.status === "CANCELLED" ? "Đơn hàng đã hủy không thể cập nhật trạng thái" : ""}
                                >
                                    Đã xác nhận
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedOrder.status === "CANCELLED") {
                                            toast.warn("Đơn hàng đã hủy không thể cập nhật trạng thái!");
                                            return;
                                        }
                                        handleUpdateStatus(selectedOrder.id, "SHIPPED");
                                    }}
                                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={selectedOrder.status === "CANCELLED"}
                                    title={selectedOrder.status === "CANCELLED" ? "Đơn hàng đã hủy không thể cập nhật trạng thái" : ""}
                                >
                                    Đang giao
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedOrder.status === "CANCELLED") {
                                            toast.warn("Đơn hàng đã hủy không thể cập nhật trạng thái!");
                                            return;
                                        }
                                        handleUpdateStatus(selectedOrder.id, "COMPLETED");
                                    }}
                                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={selectedOrder.status === "CANCELLED"}
                                    title={selectedOrder.status === "CANCELLED" ? "Đơn hàng đã hủy không thể cập nhật trạng thái" : ""}
                                >
                                    Đã giao
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedOrder.status === "CANCELLED") {
                                            toast.warn("Đơn hàng đã hủy không thể cập nhật trạng thái!");
                                            return;
                                        }
                                        handleUpdateStatus(selectedOrder.id, "CANCELLED");
                                    }}
                                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={selectedOrder.status === "CANCELLED"}
                                    title={selectedOrder.status === "CANCELLED" ? "Đơn hàng đã hủy không thể cập nhật trạng thái" : ""}
                                >
                                    Hủy đơn
                                </button>

                                {/* Nút xuất hóa đơn trong modal */}
                                <ExportBillButton
                                    order={selectedOrder}
                                    variant="outline"
                                    size="medium"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Thông báo */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default OrderManagement;