package dev.sentomero.backend_ams.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtTokenUtil {
    private static final String SECRET_KEY = "M5bGHgZ7oyoJNDznCsWXAKvL2FVGcWCYltjDR71Ats8=";
    private static final long JWT_EXPIRATION = 3600000; // 1 hour in milliseconds

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY.getBytes())  // Convert to bytes
                .compact();
    }
}
