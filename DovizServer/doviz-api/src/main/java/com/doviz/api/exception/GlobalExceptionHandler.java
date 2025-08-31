package com.doviz.api.exception;

import com.doviz.api.model.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WebClientResponseException.class)
    public Mono<ResponseEntity<ApiResponse<String>>> handleWebClientException(WebClientResponseException ex) {
        log.error("WebClient error: {} - {}", ex.getStatusCode(), ex.getMessage());

        String message = "External API error: " + ex.getStatusText();
        if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
            message = "Currency or date not found";
        } else if (ex.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
            message = "Rate limit exceeded, please try again later";
        }

        return Mono.just(ResponseEntity.status(ex.getStatusCode())
                .body(ApiResponse.error(message)));
    }

    @ExceptionHandler(RuntimeException.class)
    public Mono<ResponseEntity<ApiResponse<String>>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime error: {}", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage())));
    }

    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ApiResponse<String>>> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred")));
    }
}