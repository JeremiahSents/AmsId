package dev.sentomero.backend_ams.dto;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class AmsUserDto {
    private Integer id;
    private String amsUserFname;
    private String amsUserLname;
    private String amsUsername;
    private String amsPassword;
    private String token;

}
