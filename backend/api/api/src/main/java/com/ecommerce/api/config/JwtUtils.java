package com.ecommerce.api.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.ecommerce.api.entities.AuthUser;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(AuthUser user, Long idUser) {
        return Jwts.builder()
                .claim("id_auth", user.getIdAuth())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().getNameRole())
                .claim("id_user", idUser)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public String extractRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }

    public Long extractIdUser(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("id_user", Long.class);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization").substring(7);
    }

    public Long extractIdUser(HttpServletRequest request) {
        return extractIdUser(extractTokenFromRequest(request));
    }

    public boolean hasRole(HttpServletRequest request, String role) {
        return role.equals(extractRole(extractTokenFromRequest(request)));
    }
}