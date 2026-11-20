package com.luifa.preguntados.common;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ProblemDetail handleApiException(ApiException exception, HttpServletRequest request) {
        return problem(exception.getStatus(), exception.getCode(), exception.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        ProblemDetail detail = problem(
                HttpStatus.BAD_REQUEST,
                ApiErrorCode.VALIDATION_ERROR,
                "Revisá los datos ingresados.",
                request);

        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        detail.setProperty("errors", errors);
        return detail;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableBody(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return problem(
                HttpStatus.BAD_REQUEST,
                ApiErrorCode.VALIDATION_ERROR,
                "El cuerpo de la solicitud no tiene un formato válido.",
                request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
        return problem(
                HttpStatus.BAD_REQUEST,
                ApiErrorCode.VALIDATION_ERROR,
                "El valor de '%s' no es válido.".formatted(exception.getName()),
                request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNotFound(NoResourceFoundException exception, HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, ApiErrorCode.NOT_FOUND, "Recurso no encontrado.", request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ProblemDetail handleMethodNotSupported(HttpRequestMethodNotSupportedException exception,
                                                  HttpServletRequest request) {
        return problem(
                HttpStatus.METHOD_NOT_ALLOWED,
                ApiErrorCode.METHOD_NOT_ALLOWED,
                "El método HTTP no está permitido para este recurso.",
                request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ProblemDetail handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException exception,
                                                     HttpServletRequest request) {
        return problem(
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                ApiErrorCode.UNSUPPORTED_MEDIA_TYPE,
                "El tipo de contenido no está soportado.",
                request);
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception exception, HttpServletRequest request) {
        log.error("Error inesperado procesando {} {}", request.getMethod(), request.getRequestURI(), exception);
        return problem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ApiErrorCode.INTERNAL_ERROR,
                "Ocurrió un error inesperado. Intentá nuevamente.",
                request);
    }

    private ProblemDetail problem(HttpStatus status, ApiErrorCode code, String message, HttpServletRequest request) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(status, message);
        detail.setTitle(titleFor(status));
        detail.setProperty("code", code.name());
        detail.setProperty("timestamp", Instant.now());
        detail.setInstance(URI.create(request.getRequestURI()));
        return detail;
    }

    private String titleFor(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> "Solicitud inválida";
            case UNAUTHORIZED -> "No autorizado";
            case NOT_FOUND -> "No encontrado";
            case METHOD_NOT_ALLOWED -> "Método no permitido";
            case UNSUPPORTED_MEDIA_TYPE -> "Formato no soportado";
            case CONFLICT -> "Conflicto";
            default -> "Error del servidor";
        };
    }
}
