import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyUser } from "@/api/apiAuth";
import { CircularProgress, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyAccount = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const rawToken = searchParams.get("token");
    const token = decodeURIComponent(rawToken?.trim());

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("🔄 Đang xác thực tài khoản...");
    const hasVerifiedRef = useRef(false); // Flag để tránh gọi API nhiều lần

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("❌ Không tìm thấy token xác thực!");
            return;
        }

        // Tránh gọi API nhiều lần
        if (hasVerifiedRef.current) {
            return;
        }

        const verify = async () => {
            hasVerifiedRef.current = true; // Đánh dấu đã bắt đầu xác thực
            try {
                console.log("🎯 Token FE gửi đi:", token);
                const res = await verifyUser(token);
                console.log("✅ Kết quả xác thực:", res);

                if (res?.message?.includes("thành công")) {
                    localStorage.setItem("verified_done", "true");
                    setMessage("✅ Tài khoản đã được xác minh thành công!");
                    setStatus("success");

                    // Chuyển hướng ngay lập tức để tránh các lời gọi API không cần thiết
                    setTimeout(() => {
                        // Kiểm tra xem có pending checkout products không
                        const pendingProducts = localStorage.getItem("pendingCheckoutProducts");
                        const redirectIntent = localStorage.getItem("redirectIntent");

                        if (window.opener && !window.opener.closed) {
                            if (pendingProducts && redirectIntent === "/checkout") {
                                // Nếu có pending products, chuyển về login với thông tin này
                                window.opener.location.href = "/auth/login";
                            } else {
                                window.opener.location.href = "/auth/login";
                            }
                            window.close();
                        } else {
                            navigate("/auth/login");
                        }
                    }, 2000);
                } else if (res?.status === "already_verified" || res?.message?.includes("đã được xác thực")) {
                    setMessage("⚠️ Tài khoản đã được xác minh trước đó. Bạn có thể đăng nhập ngay bây giờ.");
                    setStatus("info");
                    setTimeout(() => {
                        if (window.opener && !window.opener.closed) {
                            window.opener.location.href = "/auth/login";
                            window.close();
                        } else {
                            navigate("/auth/login");
                        }
                    }, 3000);
                } else {
                    setStatus("error");
                    setMessage("❌ Phản hồi xác thực không hợp lệ.");
                    return;
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err.message || "❌ Xác thực thất bại.";
                console.error("❌ Lỗi xác thực:", err);

                if (msg.includes("đã được xác minh trước đó") || msg.includes("xác thực trước đó")) {
                    setMessage("⚠️ Tài khoản đã được xác minh trước đó. Bạn có thể đăng nhập ngay bây giờ.");
                    setStatus("info");
                    setTimeout(() => {
                        if (window.opener && !window.opener.closed) {
                            window.opener.location.href = "/auth/login";
                            window.close();
                        } else {
                            navigate("/auth/login");
                        }
                    }, 3000);
                } else if (msg.includes("không hợp lệ") && status === "loading") {
                    // Nếu token không hợp lệ có thể do đã được sử dụng rồi
                    setMessage("⚠️ Tài khoản có thể đã được xác thực. Hãy thử đăng nhập.");
                    setStatus("info");
                    setTimeout(() => {
                        if (window.opener && !window.opener.closed) {
                            window.opener.location.href = "/auth/login";
                            window.close();
                        } else {
                            navigate("/auth/login");
                        }
                    }, 3000);
                } else {
                    setMessage(msg);
                    setStatus("error");
                }
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center w-full max-w-md"
            >
                {status === "loading" && (
                    <>
                        <CircularProgress sx={{ color: "white" }} />
                        <Typography variant="h6" sx={{ color: "white", mt: 2, textAlign: "center" }}>
                            {message}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", opacity: 0.8, mt: 1, textAlign: "center" }}>
                            Vui lòng đợi trong giây lát...
                        </Typography>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle size={64} color="lightgreen" className="mx-auto mb-4" />
                        <Typography variant="h6" sx={{ color: "lightgreen", mt: 2, textAlign: "center" }}>
                            {message}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", opacity: 0.8, mt: 1, textAlign: "center" }}>
                            Bạn sẽ được chuyển hướng đến trang đăng nhập...
                        </Typography>
                    </>
                )}

                {status === "info" && (
                    <>
                        <CheckCircle size={64} color="gold" className="mx-auto mb-4" />
                        <Typography variant="h6" sx={{ color: "gold", mt: 2, textAlign: "center" }}>
                            {message}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", opacity: 0.8, mt: 1, textAlign: "center" }}>
                            Bạn sẽ được chuyển hướng đến trang đăng nhập...
                        </Typography>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle size={64} color="tomato" className="mx-auto mb-4" />
                        <Typography variant="h6" sx={{ color: "tomato", mt: 2, textAlign: "center" }}>
                            {message}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "white", opacity: 0.8, mt: 1, textAlign: "center" }}>
                            Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.
                        </Typography>
                        <div className="flex gap-3 mt-4 justify-center">
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => navigate("/auth/resend")}
                            >
                                Gửi lại email xác thực
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate("/auth/login")}
                            >
                                Về trang đăng nhập
                            </Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyAccount;