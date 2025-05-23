import { useEffect, useState } from "react";
import { getPagedReviews } from "../../api/apiReview";
import { Card, CardContent } from "../common/Card";
import Pagination from "../common/Pagination";
import { Star, Filter, Users, BarChart3 } from "lucide-react";

const ProductReviewSection = ({ productId }) => {
    const [allReviews, setAllReviews] = useState([]); // All reviews from backend
    const [filteredReviews, setFilteredReviews] = useState([]); // Filtered reviews for display
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null); // null = all ratings
    const [ratingStats, setRatingStats] = useState({});
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        fetchAllReviews();
    }, [productId]);

    useEffect(() => {
        applyFilter();
    }, [selectedRating, allReviews]);

    useEffect(() => {
        // Reset page when filter changes
        setPage(0);
    }, [selectedRating]);

    const fetchAllReviews = async () => {
        setIsLoading(true);
        try {
            // Fetch all reviews with a large page size to get all data
            const res = await getPagedReviews(productId, 0, 1000); // Get all reviews
            const reviews = res.content || [];

            setAllReviews(reviews);
            setTotalReviews(reviews.length);

            // Calculate rating statistics from actual data
            const stats = {};
            for (let rating = 1; rating <= 5; rating++) {
                stats[rating] = reviews.filter(review => review.rating === rating).length;
            }
            setRatingStats(stats);

        } catch (err) {
            console.error("Lỗi khi tải đánh giá", err);
            setAllReviews([]);
            setTotalReviews(0);
            setRatingStats({});
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilter = () => {
        let filtered = [...allReviews];

        // Apply rating filter
        if (selectedRating !== null) {
            filtered = filtered.filter(review => review.rating === selectedRating);
        }

        setFilteredReviews(filtered);

        // Calculate pagination for filtered results
        const totalFilteredPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        setTotalPages(totalFilteredPages);
    };

    const getCurrentPageReviews = () => {
        const startIndex = page * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredReviews.slice(startIndex, endIndex);
    };

    const renderStars = (rating, filled = true) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${index < rating
                    ? filled
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                    }`}
            />
        ));
    };

    const getFilteredCount = () => {
        if (selectedRating === null) return totalReviews;
        return ratingStats[selectedRating] || 0;
    };

    if (isLoading) {
        return (
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">Đang tải đánh giá...</h3>
                <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
            </div>
        );
    }

    if (totalReviews === 0) return (
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">Đánh giá sản phẩm</h3>
            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
        </div>
    );

    return (
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-600" />
                        </div>
                        Đánh giá sản phẩm
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{totalReviews} đánh giá</span>
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Lọc theo số sao:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* All ratings button */}
                        <button
                            onClick={() => setSelectedRating(null)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${selectedRating === null
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                                }`}
                        >
                            <span className="font-medium">Tất cả</span>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                {totalReviews}
                            </span>
                        </button>

                        {/* Individual rating buttons */}
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <button
                                key={rating}
                                onClick={() => setSelectedRating(rating)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 ${selectedRating === rating
                                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-lg"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                                    }`}
                            >
                                <div className="flex items-center gap-1">
                                    {selectedRating === rating ? (
                                        // White stars when button is active
                                        Array.from({ length: 5 }, (_, index) => (
                                            <Star
                                                key={index}
                                                className={`w-4 h-4 ${index < rating
                                                    ? "text-white fill-white"
                                                    : "text-white/40"
                                                    }`}
                                            />
                                        ))
                                    ) : (
                                        // Yellow stars when button is not active
                                        renderStars(rating)
                                    )}
                                </div>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                    {ratingStats[rating] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Active filter display */}
                    {selectedRating !== null && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800">
                                <span className="font-medium">Đang hiển thị:</span> {getFilteredCount()} đánh giá {selectedRating} sao
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="p-6">
                {getCurrentPageReviews().length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">
                            {selectedRating !== null
                                ? `Không có đánh giá ${selectedRating} sao nào.`
                                : "Không có đánh giá nào."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {getCurrentPageReviews().map((review) => (
                            <Card key={review.id} className="hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {review.customerName?.charAt(0)?.toUpperCase() || "U"}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{review.customerName || "Khách hàng"}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                    <span className="text-sm text-gray-500">({review.rating}/5)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>

                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>

                                    {/* Rating badge */}
                                    <div className="mt-3 flex justify-end">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${review.rating >= 4
                                            ? "bg-green-100 text-green-800"
                                            : review.rating >= 3
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                            }`}>
                                            <Star className="w-3 h-3 fill-current" />
                                            {review.rating} sao
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviewSection;
