package com.luifa.preguntados.config;

import com.luifa.preguntados.security.AdminPinInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties properties;
    private final AdminPinInterceptor adminPinInterceptor;

    public WebConfig(AppProperties properties, AdminPinInterceptor adminPinInterceptor) {
        this.properties = properties;
        this.adminPinInterceptor = adminPinInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(properties.cors().allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminPinInterceptor).addPathPatterns("/api/v1/admin/**");
    }
}
