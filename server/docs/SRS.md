# Campus Connect - Software Requirements Specification (SRS)

## 1. Introduction
Campus Connect is a campus networking platform designed to help college students—especially freshers—connect with their cohort, seniors, clubs, and departments. Using their official college email, students can sign up and are automatically added to relevant groups (branch, class, section, year). The platform supports posts, quick updates, comments, likes, and notifications, improving discoverability and direct access to seniors.

### 1.1 Purpose
Define functional and non-functional requirements for the Campus Connect backend API and data model.

### 1.2 Scope
- Authentication and onboarding using college email
- Auto-group assignment based on branch/class/section/year derived from college ID
- Feed for posts and quick posts
- Comments, likes, and notifications
- Group memberships and moderation
- Profile additional details (skills, interests, socials)

### 1.3 Definitions
- Cohort Group: Group auto-assigned by branch/class/section/year
- Quick Post: Short text update (<= 280 chars)

## 2. Overall Description
### 2.1 Product perspective
- RESTful backend with Express + MongoDB (Mongoose).
- JWT or session-based auth (future phase).

### 2.2 User classes
- Student (Default)
- Senior/Alumni (elevated privileges in mentor groups - future)
- Moderator (group-level moderation)
- Admin (system level)

### 2.3 Assumptions and dependencies
- Students have valid college emails.
- Institution provides consistent ID format to derive cohort attributes.
- MongoDB availability.

## 3. Functional Requirements
1. Account
   - Sign up with college email, set password.
   - Email verification flow (token via email). [phase 2]
   - Auto-assign user to cohort group using branch/class/section/year.
2. Profile
   - View and edit additional details: bio, skills, interests, socials.
3. Groups
   - View groups the user belongs to.
   - Auto-assigned cohort group is immutable by user.
   - Admin can create custom groups (clubs/departments);
     users can request to join or be invited. [phase 2]
4. Posts & Quick Posts
   - Create, read, delete own posts/quick posts.
   - Visibility: public, group, branch, class, year, section.
   - Attach media URLs.
5. Comments & Likes
   - Comment on posts and quick posts; nested replies.
   - Like posts, quick posts, and comments; one like per user per entity.
6. Notifications
   - Receive notifications for likes, comments, replies, mentions, group invites.
   - Mark as read.
7. Feed
   - Personalized feed based on group memberships and visibility.
8. Search
   - Search users by name/skills/interests. [phase 2]
9. Safety & Moderation
   - Report content; moderator actions (hide/delete). [phase 2]

## 4. Data Model
- User
  - collegeEmail, name, avatarUrl, branch, year, className, section, rollNumber
  - passwordHash, isVerified, status
  - additional: bio, skills[], interests[], social{}
- Group
  - type, name, branch, className, section, year, createdBy, isAutoAssigned, description
- Membership
  - user, group, role
- Post
  - author, title, content, mediaUrls[], tags[], visibility, group, likesCount, commentsCount
- QuickPost
  - author, text, visibility, group, likesCount, commentsCount
- Comment
  - author, post|quickPost, content, parent, likesCount
- Like
  - user, post|quickPost|comment
- Notification
  - recipient, type, data, readAt

## 5. Non-functional Requirements
- Performance: P95 API latency < 300ms for common queries at 1k RPS (future scale goal).
- Security: Passwords hashed with bcrypt/argon2; JWT with reasonable expiry. [phase 2]
- Availability: 99.5% monthly.
- Observability: Request logging, error tracking. [phase 2]
- Privacy: Only campus users; data minimization and consent for public visibility.

## 6. External Interface Requirements
- REST JSON APIs (to be defined in OpenAPI in future).
- Email service integration for verification and notifications. [phase 2]

## 7. Constraints
- Must work with institutional email systems.
- Comply with college policies.

## 8. Future Enhancements
- Direct messaging and mentorship matching
- Events and resource sharing
- File attachments with storage service

## 9. Acceptance Criteria (MVP)
- A user can sign up (mocked or minimal) and is assigned to a cohort group.
- User can create a post and quick post visible to their cohort group.
- Comment and like work on posts/quick posts.
- Basic notifications stored on events (notifier dispatch may be mocked).

---
This SRS will evolve with feedback and as we refine requirements with the team.
