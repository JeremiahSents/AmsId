package dev.sentomero.backend_ams.models;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Ams_User")
public class AmsUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;  // lowercase

    @Column(name = "Ams_Fname")
    private String amsUserFname;

    @Column(name = "Ams_Lname")
    private String amsUserLname;

    @Column(name = "Ams_Username", nullable = false, unique = true)
    private String amsUsername;


    @Column(name = "Ams_Password", unique = true, nullable = false)
    private String amsUserPassword;

    @Column(name = "Time_login")
    private LocalDateTime timestamp;

    @OneToMany(mappedBy = "registeredBy", cascade = CascadeType.ALL)
    private List<KpClient> registeredClients;
}