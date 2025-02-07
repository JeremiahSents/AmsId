package dev.sentomero.backend_ams.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Data
public class LoginRequest {
    private String amsUsername;
    private String amsUserPassword;
}
