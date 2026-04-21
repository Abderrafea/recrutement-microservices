package com.recruitment.userservice.controller;

import java.util.Map;

import com.recruitment.userservice.security.RsaKeyService;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/.well-known")
@RequiredArgsConstructor
public class JwksController {

    private final RsaKeyService rsaKeyService;

    @GetMapping("/jwks.json")
    public Map<String, Object> getJwks() {
        RSAKey rsaKey = new RSAKey.Builder(rsaKeyService.publicKey())
                .keyID(rsaKeyService.keyId())
                .algorithm(JWSAlgorithm.RS256)
                .build();
        return new JWKSet(rsaKey).toJSONObject();
    }
}
