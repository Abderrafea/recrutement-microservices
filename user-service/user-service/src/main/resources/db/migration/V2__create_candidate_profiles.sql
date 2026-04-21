CREATE TABLE candidate_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(100),
    address VARCHAR(255),
    summary TEXT,
    cv_url VARCHAR(500)
);

CREATE TABLE candidate_profile_skills (
    candidate_profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL
);
