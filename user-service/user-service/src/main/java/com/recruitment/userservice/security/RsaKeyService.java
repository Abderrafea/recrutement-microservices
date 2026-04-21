package com.recruitment.userservice.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.UUID;

import com.recruitment.userservice.config.JwtProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RsaKeyService {

    private final JwtProperties jwtProperties;
    private final ResourceLoader resourceLoader;

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;
    private String keyId;

    @PostConstruct
    void init() {
        this.keyId = UUID.randomUUID().toString();
        try {
            this.privateKey = loadPrivateKey(jwtProperties.privateKeyPath());
            this.publicKey = loadPublicKey(jwtProperties.publicKeyPath());
        } catch (Exception ignored) {
            generateKeyPair();
        }
    }

    public RSAPrivateKey privateKey() {
        return privateKey;
    }

    public RSAPublicKey publicKey() {
        return publicKey;
    }

    public String keyId() {
        return keyId;
    }

    private RSAPrivateKey loadPrivateKey(String path) throws IOException, GeneralSecurityException {
        Resource resource = resourceLoader.getResource(path);
        if (!resource.exists()) {
            throw new IOException("Private key resource not found");
        }
        String pem = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String content = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(content);
        return (RSAPrivateKey) KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    private RSAPublicKey loadPublicKey(String path) throws IOException, GeneralSecurityException {
        Resource resource = resourceLoader.getResource(path);
        if (!resource.exists()) {
            throw new IOException("Public key resource not found");
        }
        String pem = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String content = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
        byte[] decoded = Base64.getDecoder().decode(content);
        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
    }

    private void generateKeyPair() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair keyPair = generator.generateKeyPair();
            this.privateKey = (RSAPrivateKey) keyPair.getPrivate();
            this.publicKey = (RSAPublicKey) keyPair.getPublic();
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to generate RSA key pair", exception);
        }
    }
}
