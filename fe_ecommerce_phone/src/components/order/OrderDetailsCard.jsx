import React from "react";
import StarRatingInput from "../review/StarRatingInput";

const OrderDetailsCard = ({ 
    orderDetails, 
    orderStatus,
    reviewInputs,
    onRatingChange,
    onCommentChange,
    onSubmitReview
}) => {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Chi tiết đơn hàng
            </h4>
            
            {orderDetails.map((detail) => (
                <div
                    key={detail.id}
                    className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={detail.productImage || "/placeholder.png"}
                                alt={detail.productName}
                                className="w-20 h-20 object-cover rounded-lg shadow-sm"
                            />
                            <div>
                                <h5 className="font-semibold text-gray-800 text-lg">
                                    {detail.productName}
                                </h5>
                                <p className="text-sm text-gray-600">
                                    Số lượng: <span className="font-medium">{detail.quantity}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    Đơn giá: <span className="font-medium">{detail.price.toLocaleString()} VND</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                                {(detail.price * detail.quantity).toLocaleString()} VND
                            </p>
                        </div>
                    </div>

                    {/* Review Section for Completed Orders */}
                    {orderStatus === "COMPLETED" && !detail.review && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                            <h6 className="text-sm font-semibold text-gray-700 mb-3">
                                Đánh giá sản phẩm này:
                            </h6>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Chất lượng sản phẩm:
                                    </label>
                                    <StarRatingInput
                                        value={reviewInputs[detail.id]?.rating || 0}
                                        onChange={(val) => onRatingChange(detail.id, val)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-gray-600 mb-2">
                                        Nhận xét của bạn:
                                    </label>
                                    <textarea
                                        maxLength={300}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                        value={reviewInputs[detail.id]?.comment || ""}
                                        onChange={(e) => onCommentChange(detail.id, e.target.value)}
                                    />
                                    <div className="text-xs text-right text-gray-500 mt-1">
                                        {reviewInputs[detail.id]?.comment?.length || 0} / 300
                                    </div>
                                </div>
                                
                                <button
                                    disabled={!reviewInputs[detail.id]?.rating}
                                    onClick={() => onSubmitReview(detail.id)}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    Gửi đánh giá
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Display Existing Review */}
                    {orderStatus === "COMPLETED" && detail.review && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h6 className="text-sm font-semibold text-green-800 mb-2">
                                Đánh giá của bạn:
                            </h6>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-500 text-lg">
                                        {"\u2B50".repeat(detail.review.rating)}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        ({detail.review.rating}/5 sao)
                                    </span>
                                </div>
                                {detail.review.comment && (
                                    <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                        "{detail.review.comment}"
                                    </p>
                                )}
                                <p className="text-xs text-gray-500">
                                    Cảm ơn bạn đã đánh giá sản phẩm!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OrderDetailsCard;
