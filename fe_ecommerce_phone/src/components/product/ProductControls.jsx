import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import debounce from "lodash/debounce";
import { Filter, DollarSign, ArrowUpDown, RotateCcw, Search } from "lucide-react";

const ProductControls = ({ products, setFilterParams, setSortCriteria }) => {
    const [priceRange, setPriceRange] = useState({ minValue: null, maxValue: null });
    const [sortValue, setSortValue] = useState("");

    const sortOptions = [
        { value: "", label: "Mặc định" },
        { value: "newest", label: "Mới nhất" },
        { value: "bestselling", label: "Bán chạy" },
        { value: "priceAsc", label: "Giá tăng dần" },
        { value: "priceDesc", label: "Giá giảm dần" },
    ];

    // Debounce hàm cập nhật filterParams
    const debouncedSetFilterParams = useCallback(
        debounce((newPriceRange) => {
            setFilterParams({ priceRange: newPriceRange });
        }, 500),
        [setFilterParams]
    );

    useEffect(() => {
        debouncedSetFilterParams(priceRange);
    }, [priceRange, debouncedSetFilterParams]);

    const handlePriceFilter = (event) => {
        const { name, value } = event.target;
        setPriceRange((prev) => ({
            ...prev,
            [name]: value === "" ? null : Number(value),
        }));
    };

    const handleSort = (selectedOption) => {
        const newSortCriteria = selectedOption ? selectedOption.value : "";
        setSortValue(newSortCriteria);
        setSortCriteria(newSortCriteria);
    };

    const handleReset = () => {
        setPriceRange({ minValue: null, maxValue: null });
        setSortValue("");
        setSortCriteria("");
    };

    const getMinPrice = () => {
        const prices = products.map((p) => p.discountedPrice || p.sellingPrice || 0);
        return Math.min(...prices.filter((p) => !isNaN(p))) || 0;
    };

    const getMaxPrice = () => {
        const prices = products.map((p) => p.discountedPrice || p.sellingPrice || 0);
        return Math.max(...prices.filter((p) => !isNaN(p))) || 10000000;
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: "white",
            borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
            color: "#374151",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
            borderRadius: "0.75rem",
            minHeight: "44px",
            "&:hover": {
                borderColor: "#3B82F6",
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: "white",
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: "1px solid #E5E7EB",
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? "#3B82F6"
                : state.isFocused
                    ? "#EBF4FF"
                    : "white",
            color: state.isSelected ? "white" : "#374151",
            "&:hover": {
                backgroundColor: state.isSelected ? "#3B82F6" : "#EBF4FF",
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: "#374151",
        }),
        placeholder: (provided) => ({
            ...provided,
            color: "#9CA3AF",
        }),
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Bộ lọc sản phẩm</h3>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Price Filter */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <label className="text-sm font-medium text-gray-700">Khoảng giá</label>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <input
                                type="number"
                                name="minValue"
                                placeholder={`Từ ${getMinPrice().toLocaleString()}`}
                                value={priceRange.minValue || ""}
                                onChange={handlePriceFilter}
                                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        <span className="text-gray-400 font-medium">-</span>
                        <div className="flex-1">
                            <input
                                type="number"
                                name="maxValue"
                                placeholder={`Đến ${getMaxPrice().toLocaleString()}`}
                                value={priceRange.maxValue || ""}
                                onChange={handlePriceFilter}
                                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Giá từ {getMinPrice().toLocaleString()} - {getMaxPrice().toLocaleString()} VND
                    </p>
                </div>

                {/* Sorting */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-purple-600" />
                        <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
                    </div>
                    <Select
                        options={sortOptions}
                        value={sortOptions.find((option) => option.value === sortValue) || sortOptions[0]}
                        onChange={handleSort}
                        className="w-full"
                        styles={customStyles}
                        isClearable={false}
                        placeholder="Chọn cách sắp xếp"
                    />
                </div>

                {/* Reset Button */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-orange-600" />
                        <label className="text-sm font-medium text-gray-700">Đặt lại bộ lọc</label>
                    </div>
                    <button
                        onClick={handleReset}
                        className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Đặt lại
                    </button>
                </div>
            </div>

            {/* Active Filters Display */}
            {(priceRange.minValue || priceRange.maxValue || sortValue) && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {priceRange.minValue && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Giá từ: {priceRange.minValue.toLocaleString()} VND
                            </span>
                        )}
                        {priceRange.maxValue && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Giá đến: {priceRange.maxValue.toLocaleString()} VND
                            </span>
                        )}
                        {sortValue && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                Sắp xếp: {sortOptions.find(opt => opt.value === sortValue)?.label}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductControls;