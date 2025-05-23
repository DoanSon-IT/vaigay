package com.sondv.phone.repository;

import com.sondv.phone.entity.RoleName;
import com.sondv.phone.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    Optional<User> findByResetToken(String resetToken);

    List<User> findByRoles(RoleName roleName);

    Optional<User> findByRefreshToken(String refreshToken);

    Optional<User> findByVerificationToken(String verificationToken);

    List<User> findTop10ByOrderByCreatedAtDesc();

    Page<User> findAllByOrderByIdAsc(Pageable pageable);

    Page<User> findAllByOrderByIdDesc(Pageable pageable);

    List<User> findByCreatedAtAfter(LocalDateTime startDate);

    @Query("SELECT u FROM User u ORDER BY u.createdAt DESC LIMIT ?1")
    List<User> findTopNByOrderByCreatedAtDesc(int limit);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(String keyword, Pageable pageable);
}