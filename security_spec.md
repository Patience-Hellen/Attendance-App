# Security Specification - JKUAT Geofence Attendance

## 1. Data Invariants
- A user can only create their own profile.
- Only the owner (UID) can update their profile.
- Only lecturers can create sessions.
- Students can only read active sessions.
- Students can only mark attendance for a session they are physically near (checked by logic + rules where possible, but rules can't check distance, so we rely on session ID and student ID).
- An attendance record must contain the student's UID.
- Attendance records are immutable once created (for students).
- Only the session lecturer can see all attendance records for their session.

## 2. The "Dirty Dozen" Payloads (Attacker Strategy)
1. **Identity Theft**: Student A tries to create a user profile for Student B.
2. **Role Escalation**: Student A tries to set their role to 'lecturer' during creation.
3. **Ghost Session**: Student A tries to create a session (lecturer role required).
4. **Session Hijacking**: Student A tries to update a session created by Lecturer B.
5. **Radius Tampering**: Student A tries to update a session to have a 10km radius.
6. **Time Travel**: Student A tries to mark attendance for a past/inactive session.
7. **Identity Spoofing**: Student A tries to log attendance for Student B.
8. **Shadow Data**: Attacker tries to add `isVerified: true` to their user profile.
9. **Bulk Read**: Student A tries to list all user profiles in the system.
10. **Admin Proxy**: Attacker tries to delete a session they didn't create.
11. **Malicious ID**: Attacker tries to use a 1MB string as a sessionId.
12. **Attendance Modification**: Student A tries to update their attendance record status from 'Absent' to 'Present' after the session.

## 3. Test Runner Plan
We will use `@firebase/rules-unit-testing` (planned for later if environment allows, but for now we focus on the rules).
