CREATE TABLE job_offers (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contract_type VARCHAR(30) NOT NULL,
    salary VARCHAR(100),
    experience_level VARCHAR(30) NOT NULL,
    employer_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    published_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NULL,
    application_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE job_offer_required_skills (
    job_offer_id BIGINT NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL
);
