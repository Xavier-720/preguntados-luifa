package com.luifa.preguntados.security;

import com.luifa.preguntados.common.ApiErrorCode;
import com.luifa.preguntados.common.ApiException;
import com.luifa.preguntados.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminPinInterceptor implements HandlerInterceptor {

    private static final String HEADER = "X-Admin-Pin";

    private final AppProperties properties;

    public AdminPinInterceptor(AppProperties properties) {
        this.properties = properties;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String provided = request.getHeader(HEADER);
        byte[] expected = properties.adminPin().getBytes(StandardCharsets.UTF_8);
        // Comparamos en tiempo constante para no filtrar el PIN por la demora de respuesta.
        boolean valid = provided != null
                && MessageDigest.isEqual(provided.getBytes(StandardCharsets.UTF_8), expected);

        if (!valid) {
            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    ApiErrorCode.ADMIN_UNAUTHORIZED,
                    "PIN de administrador incorrecto.");
        }
        return true;
    }
}
