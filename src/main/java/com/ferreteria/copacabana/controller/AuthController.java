package com.ferreteria.copacabana.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authManager;

    public record LoginReq(String usuario, String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq r, HttpServletRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(r.usuario().trim(), r.password()));
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);
            req.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, ctx);
            return ResponseEntity.ok(info(auth));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario o contraseña incorrectos"));
        }
    }

    @GetMapping("/me")
    public Map<String, String> me(Authentication auth) {
        return info(auth);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest req) {
        if (req.getSession(false) != null) req.getSession(false).invalidate();
        SecurityContextHolder.clearContext();
        return Map.of("ok", "true");
    }

    private Map<String, String> info(Authentication auth) {
        String rol = auth.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("EMPLEADO");
        return Map.of("usuario", auth.getName(), "rol", rol);
    }
}
