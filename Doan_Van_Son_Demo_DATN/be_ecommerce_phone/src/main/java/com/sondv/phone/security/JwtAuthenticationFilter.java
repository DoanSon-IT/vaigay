package com.sondv.phone.security;

import com.sondv.phone.entity.User;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.util.CookieUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/login/oauth2/**",
            "/oauth2/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/api/products",
            "/api/products/featured",
            "/api/products/newest",
            "/api/products/bestselling",
            "/api/products/filtered",
            "/api/products/*/related",
            "/api/products/*",
            "/api/categories/**",
            "/api/reviews/product/**",
            "/api/discounts/spin",
            "/api/discounts/active"
    };

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return Arrays.stream(PUBLIC_ENDPOINTS)
                .anyMatch(pattern -> pathMatcher.match(pattern, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        logger.info("🔍 Xử lý request: {}", request.getRequestURI());

        Optional<String> tokenOpt = CookieUtil.getCookieValue(request, "auth_token");
        if (tokenOpt.isEmpty()) {
            logger.info("🚫 Không có auth token trong request");
            chain.doFilter(request, response);
            return;
        }

        String token = tokenOpt.get();
        logger.info("🔑 Nhận token từ cookie: {}", token.substring(0, 10) + "...");

        try {
            if (!jwtUtil.isTokenValid(token)) {
                logger.warn("⛔ Token không hợp lệ hoặc đã hết hạn!");
                chain.doFilter(request, response);
                return;
            }

            String email = jwtUtil.extractUsername(token);
            logger.info("📧 Trích xuất email từ token: {}", email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> {
                            logger.error("⚠ User không tồn tại trong DB: {}", email);
                            return new JwtException("User không tồn tại!");
                        });

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("✅ Đã xác thực user: {}", email);
            }
        } catch (ExpiredJwtException e) {
            logger.warn("🔄 Token đã hết hạn: {}", e.getMessage());
        } catch (JwtException e) {
            logger.warn("⛔ Lỗi xác thực token: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
            return;
        }

        chain.doFilter(request, response);
    }
}
