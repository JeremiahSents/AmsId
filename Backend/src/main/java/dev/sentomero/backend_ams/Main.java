package dev.sentomero.backend_ams;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;




@SpringBootApplication
public class Main {

	public static void main(String[] args) {
//		SecretKey key = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);
//		String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
//		System.out.println("Base64 Encoded Secret Key: " + base64Key);
		SpringApplication.run(Main.class, args);
	}

}
