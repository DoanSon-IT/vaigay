import React, { useContext } from "react";
import AppContext from "../../context/AppContext";

function CartTable({ cartItems, setCartItems, selectedItems, handleSelectItem, handleSelectAll }) {
    const { removeFromCart, updateCartItemQuantity } = useContext(AppContext);

    const handleRemoveItem = (id) => {
        removeFromCart(id);
    };

    const handleUpdateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        updateCartItemQuantity(id, newQuantity);
    };

    const isAllSelected = cartItems.every((item) => selectedItems.has(item.id));

    return (
        <div className="w-11/12 md:w-4/5 mx-auto mb-8">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-4">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                        </th>
                        <th className="p-4 text-black">Sản phẩm</th>
                        <th className="p-4 text-black">Giá</th>
                        <th className="p-4 text-black">Số lượng</th>
                        <th className="p-4 text-black">Tổng cộng</th>
                        <th className="p-4 text-black">Tùy chọn</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <tr key={item.id} className="border-b">
                            <td className="p-4">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                            </td>
                            <td className="p-4 flex items-center">
                                {item.images?.[0]?.imageUrl ? (
                                    <img
                                        src={item.images[0].imageUrl}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover mr-4"
                                    />
                                ) : (
                                    <span>Không có ảnh</span>
                                )}
                                <span>{item.name}</span>
                            </td>

                            {/* ✅ Cập nhật logic hiển thị giá */}
                            <td className="p-4">
                                {item.originalPrice && item.originalPrice > item.price ? (
                                    <div className="flex flex-col">
                                        <span className="text-blue-600 font-semibold">
                                            {(item.price || 0).toLocaleString("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            })}
                                        </span>
                                        <span className="text-sm text-gray-500 line-through">
                                            {item.originalPrice.toLocaleString("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            })}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-blue-600 font-semibold">
                                        {(item.price || 0).toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                )}
                            </td>

                            <td className="p-4 text-black">
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleUpdateQuantity(item.id, parseInt(e.target.value))
                                    }
                                    className="w-16 p-1 border rounded"
                                />
                            </td>

                            {/* ✅ Tổng cộng = giá sau giảm * số lượng */}
                            <td className="p-4">
                                <span className="text-base font-semibold text-blue-600">
                                    {(item.price * item.quantity).toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </span>
                            </td>

                            <td className="p-4">
                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CartTable;
