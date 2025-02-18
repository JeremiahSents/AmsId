package dev.sentomero.backend_ams.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
public class healthContoller {

    @RequestMapping
    public String health() {
        return "OK";
    }
}
