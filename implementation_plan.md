# Multi-Feature Enhancement: Recruitment Platform

Five features to implement across the frontend (React/TypeScript) and backend (Spring Boot Java microservices).

---

## Feature 1: Recruiter Can See the Motivation Letter

**Problem:** The `ViewApplicationsPage` currently shows the `ApplicationTable` but the table doesn't display the `coverLetter` field, even though the API already returns it.

### Proposed Changes

#### [MODIFY] [ApplicationTable.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/components/applications/ApplicationTable.tsx)

- Add a "Lettre de motivation" column to the table
- Display the `coverLetter` field from each application, truncated with a "Voir plus" expandable mechanism (e.g., a click-to-expand or a modal)

> [!NOTE]
> No backend changes needed — `coverLetter` is already returned by the `ApplicationResponse` DTO.

---

## Feature 2: Move CV Upload from Profile to Application (Per-Offer CV)

**Problem:** Currently, CVs are uploaded to the candidate profile (global). The recruiter downloads CV from the user-service (`/api/users/{id}/cv`). Instead, CVs should be uploaded **per application** when applying to an offer, and the recruiter should download the CV attached to that specific application.

### Proposed Changes

#### Backend — Application Service

#### [MODIFY] [JobApplication.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/domain/JobApplication.java)

- Add a `cvFilePath` field (String, nullable) to store the path to the uploaded CV file on disk

#### [MODIFY] [ApplicationRequest.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/dto/ApplicationRequest.java)

- Change from a JSON record to accept `multipart/form-data` — the controller will handle this instead of binding to a record

#### [MODIFY] [ApplicationResponse.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/dto/ApplicationResponse.java)

- Add `cvFileName` field (String) so the frontend knows there's a CV to download

#### [MODIFY] [ApplicationController.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/controller/ApplicationController.java)

- Change `apply()` to accept `multipart/form-data` (jobId, coverLetter, cvFile)
- Add a `GET /{id}/cv` endpoint to download the CV file for a given application

#### [MODIFY] [ApplicationService.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/service/ApplicationService.java)

- Handle CV file storage in the `apply()` method (reuse a `FileStorageService` similar to user-service)
- Add `downloadCv(Long applicationId)` method with employer/admin authorization

#### [NEW] [FileStorageService.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/service/FileStorageService.java)

- A file storage service for storing application CVs (similar to user-service's version)

#### [NEW] [StorageProperties.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/config/StorageProperties.java)

- Configuration properties for CV storage directory

#### [MODIFY] [ApplicationMapper.java](file:///c:/Users/abderrafea/recrutement-microservices/application-service/application-service/src/main/java/com/recruitment/applicationservice/mapper/ApplicationMapper.java)

- Update to include `cvFileName` in the response

#### Backend — Application Service Config

#### [MODIFY] application.yml (application-service config)

- Add `storage.cv-directory` property

#### Frontend

#### [MODIFY] [ApplyPage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/candidate/ApplyPage.tsx)

- Add a file input for CV upload
- Send as `FormData` (multipart) instead of JSON

#### [MODIFY] [applications.api.ts](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/api/applications.api.ts)

- Update `applyToJob()` to send `FormData` with the CV file

#### [MODIFY] [application.types.ts](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/types/application.types.ts)

- Add `cvFileName` to `Application` type
- Update `ApplyPayload` to include optional `cvFile`

#### [MODIFY] [CandidateProfilePage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/candidate/CandidateProfilePage.tsx)

- **Remove** the CV upload section entirely

#### [MODIFY] [auth.api.ts](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/api/auth.api.ts)

- **Remove** the `uploadCv` function

#### [MODIFY] [ViewApplicationsPage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/employer/ViewApplicationsPage.tsx)

- Change the CV download link to point to the application-service endpoint (`/api/applications/{id}/cv`) instead of user-service

---

## Feature 3: Prevent Duplicate Applications (Frontend)

**Problem:** The backend already has duplicate prevention (returns HTTP 409 via `DuplicateApplicationException`), but the frontend doesn't provide clear UX guidance. The candidate can still navigate to the apply page for an offer they've already applied to.

### Proposed Changes

#### [MODIFY] [JobDetailPage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/public/JobDetailPage.tsx)

- For logged-in candidates, check if they've already applied to this job (use `useCandidateApplications` or a new dedicated check)
- If already applied: disable the "Postuler" button and show "Déjà postulé"

#### [MODIFY] [ApplyPage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/candidate/ApplyPage.tsx)

- Before showing the form, check if the candidate has already applied
- If yes, redirect to applications page with a toast message
- Improve the error handler for 409 responses to show a clear French message

---

## Feature 4: Change Password

**Problem:** There's currently no password change functionality.

### Proposed Changes

#### Backend — User Service

#### [MODIFY] [UserController.java](file:///c:/Users/abderrafea/recrutement-microservices/user-service/user-service/src/main/java/com/recruitment/userservice/controller/UserController.java)

- Add `PUT /api/users/{id}/password` endpoint

#### [NEW] [ChangePasswordRequest.java](file:///c:/Users/abderrafea/recrutement-microservices/user-service/user-service/src/main/java/com/recruitment/userservice/dto/user/ChangePasswordRequest.java)

- DTO with `currentPassword` and `newPassword` fields

#### [MODIFY] [UserService.java](file:///c:/Users/abderrafea/recrutement-microservices/user-service/user-service/src/main/java/com/recruitment/userservice/service/UserService.java)

- Add `changePassword(Long userId, ChangePasswordRequest request)` method
- Verify current password matches before updating
- Encode new password with BCrypt

#### Frontend

#### [MODIFY] [auth.api.ts](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/api/auth.api.ts)

- Add `changePassword(userId, payload)` API function

#### [MODIFY] [CandidateProfilePage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/candidate/CandidateProfilePage.tsx)

- Add a "Modifier le mot de passe" section with current/new/confirm password fields

#### [MODIFY] [EmployerProfilePage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/employer/EmployerProfilePage.tsx)

- Add the same "Modifier le mot de passe" section

---

## Feature 5: Delete Account (Self-Deletion)

**Problem:** The backend `deleteUser` already supports self-deletion (`isSelfOrAdmin` check), but there's no UI for the user to delete their own account.

### Proposed Changes

#### Frontend

#### [MODIFY] [auth.api.ts](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/api/auth.api.ts)

- Add `deleteMyAccount(userId)` function (or reuse existing `deleteUser`)

#### [MODIFY] [CandidateProfilePage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/candidate/CandidateProfilePage.tsx)

- Add a "Supprimer mon compte" danger zone section with a confirmation dialog

#### [MODIFY] [EmployerProfilePage.tsx](file:///c:/Users/abderrafea/recrutement-microservices/frontend-app/src/pages/employer/EmployerProfilePage.tsx)

- Add the same "Supprimer mon compte" danger zone section

> [!NOTE]
> The backend already handles self-deletion with proper authorization. The existing `deleteUser` function in `auth.api.ts` can be reused. After deletion, the user should be logged out and redirected to the homepage.

---

## Open Questions

> [!IMPORTANT]
> **CV Upload Required or Optional?** Should CV upload be **mandatory** when applying to an offer, or should it remain optional? Currently thinking **mandatory** since it replaces the profile-level upload.

> [!IMPORTANT]
> **Keep profile CV for existing data?** Should we also clean up/remove the `cvUrl` from `CandidateProfile` entity on the backend, or just leave it unused? Removing it would require a database migration. I'll leave the backend field as-is and just remove the frontend upload UI.

---

## Verification Plan

### Automated Tests
- Build the application-service and user-service with Maven to ensure compilation passes
- Run the frontend with `npm run dev` and test each feature flow

### Manual Verification
1. **Motivation letter:** Navigate to employer's ViewApplicationsPage → verify coverLetter is visible
2. **CV per-offer:** Apply to a job with CV → verify recruiter can download it from the application
3. **Duplicate prevention:** Apply to a job → try applying again → verify button is disabled / error shown
4. **Password change:** Change password on profile → log out → log in with new password
5. **Account deletion:** Delete account → verify redirect to homepage and data cleanup
