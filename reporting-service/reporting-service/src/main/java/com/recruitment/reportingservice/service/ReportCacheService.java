package com.recruitment.reportingservice.service;

import java.time.LocalDateTime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.reportingservice.domain.ReportCache;
import com.recruitment.reportingservice.repository.ReportCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportCacheService {

    private final ReportCacheRepository reportCacheRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public <T> T cache(String key, T payload) {
        try {
            ReportCache cache = reportCacheRepository.findByCacheKey(key).orElse(ReportCache.builder().cacheKey(key).build());
            cache.setPayload(objectMapper.writeValueAsString(payload));
            cache.setGeneratedAt(LocalDateTime.now());
            reportCacheRepository.save(cache);
            return payload;
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to cache report payload", exception);
        }
    }
}
