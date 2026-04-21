CREATE TABLE employer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    company_description TEXT,
    website VARCHAR(255),
    industry VARCHAR(255)
);
