package com.recruitment.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class UserHeaderPropagationFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return exchange.getPrincipal()
                .cast(org.springframework.security.core.Authentication.class)
                .flatMap(authentication -> {
                    if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
                        String userId = jwtAuthenticationToken.getToken().getClaimAsString("userId");
                        String email = jwtAuthenticationToken.getToken().getClaimAsString("email");
                        String role = jwtAuthenticationToken.getToken().getClaimAsString("role");
                        ServerHttpRequest mutatedRequest = exchange.getRequest()
                                .mutate()
                                .headers(headers -> {
                                    if (userId != null) {
                                        headers.set("X-User-Id", userId);
                                    }
                                    if (email != null) {
                                        headers.set("X-User-Email", email);
                                    }
                                    if (role != null) {
                                        headers.set("X-User-Role", role);
                                    }
                                })
                                .build();
                        return chain.filter(exchange.mutate().request(mutatedRequest).build());
                    }
                    return chain.filter(exchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
