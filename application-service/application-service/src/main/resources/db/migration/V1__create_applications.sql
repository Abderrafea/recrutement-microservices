CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    cover_letter TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    applied_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    employer_note TEXT,
    CONSTRAINT uk_application_candidate_job UNIQUE (candidate_id, job_id)
);
