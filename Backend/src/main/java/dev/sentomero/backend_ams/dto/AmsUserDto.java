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
    private String amsPassword; // Renamed to match your service logic
    private String token;

    // Constructor without token (for registration or basic user retrieval)
    public AmsUserDto(String fname, String lname, String username) {
        this.amsUserFname = fname;
        this.amsUserLname = lname;
        this.amsUsername = username;
    }

    // Constructor with token (for authentication responses)
    public AmsUserDto(String fname, String lname, String username, String token) {
        this.amsUserFname = fname;
        this.amsUserLname = lname;
        this.amsUsername = username;
        this.token = token;
    }
}
