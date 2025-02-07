package dev.sentomero.backend_ams.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private String message;
}