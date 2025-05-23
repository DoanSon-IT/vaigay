import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AnnouncementBar from "../components/layout/AnnouncementBar";
import ScrollToTop from "../components/common/ScrollToTop";
import SmartChatCenter from "../components/common/SmartChatCenter";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
// import RandomDiscount from "../components/common/RandomDiscount";
import FallingFlowers from "../components/effects/FallingFlowers";

const CustomerLayout = () => {
    const { auth } = useContext(AppContext);

    return (
        <div className="min-h-screen bg-white w-full flex flex-col relative overflow-x-hidden">
            <FallingFlowers />
            <AnnouncementBar />
            <Header />
            <main className="flex w-full flex-grow pt-[64px] relative">
                <div className="w-full max-w-[2000px] mx-auto">
                    <Outlet />
                </div>
            </main>
            <Footer />
            <div className="fixed bottom-24 right-5 z-[1001] flex flex-col gap-4">
                {/* <RandomDiscount /> */}
                <SmartChatCenter userId={auth?.id || -1} />
                <ScrollToTop />
            </div>
        </div>
    );
};

export default CustomerLayout;