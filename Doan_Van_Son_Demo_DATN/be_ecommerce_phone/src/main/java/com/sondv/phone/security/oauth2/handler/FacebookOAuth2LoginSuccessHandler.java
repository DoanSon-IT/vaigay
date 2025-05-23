package com.sondv.phone.security.oauth2.handler;

import com.sondv.phone.entity.AuthProvider;
import com.sondv.phone.entity.User;
import com.sondv.phone.entity.RoleName;
import com.sondv.phone.entity.Customer;
import com.sondv.phone.repository.UserRepository;
import com.sondv.phone.repository.RoleRepository;
import com.sondv.phone.repository.CustomerRepository;
import com.sondv.phone.security.JwtUtil;
import com.sondv.phone.security.oauth2.user.CustomOAuth2User;
import com.sondv.phone.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FacebookOAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomOAuth2User oauthUser)) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Invalid OAuth2 user type");
            return;
        }

        String email = oauthUser.getEmail();
        if (email == null) {
            throw new IllegalStateException("Email from Facebook is null");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user = userOpt.orElseGet(() -> {
            User newUser = User.oauthUser(oauthUser, AuthProvider.FACEBOOK);
            // Gán vai trò CUSTOMER
            newUser.setRoles(Collections.singleton(RoleName.CUSTOMER));
            newUser = userRepository.save(newUser);
            // Tạo bản ghi Customer
            Customer customer = new Customer();
            customer.setUser(newUser);
            customerRepository.save(customer);
            return newUser;
        });

        String jwt = jwtUtil.generateToken(user);
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());

        CookieUtil.addCookie(response, "auth_token", jwt, (int) Duration.ofDays(1).getSeconds(), true, "None");
        CookieUtil.addCookie(response, "refresh_token", refresh, (int) Duration.ofDays(7).getSeconds(), true, "None");

        String target = Optional.ofNullable(request.getParameter("state"))
                .filter(path -> path.startsWith("/"))
                .map(path -> "http://localhost:3000" + path)
                .orElse("http://localhost:3000/auth/oauth2/success");

        response.sendRedirect(target);
    }
}