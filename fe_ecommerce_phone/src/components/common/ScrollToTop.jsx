import { useState, useEffect } from "react";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        isVisible && (
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-4 right-4 bg-black text-white p-2.5 sm:p-3 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-lg z-[999]"
            >
                <span className="text-lg sm:text-xl">↑</span>
            </button>
        )
    );
};

export default ScrollToTop;
