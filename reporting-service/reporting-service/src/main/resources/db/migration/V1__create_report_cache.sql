CREATE TABLE report_cache (
    id BIGSERIAL PRIMARY KEY,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    payload TEXT NOT NULL,
    generated_at TIMESTAMP NOT NULL
);
