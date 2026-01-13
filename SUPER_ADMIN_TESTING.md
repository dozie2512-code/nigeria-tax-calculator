# Super Admin Feature Testing Guide

## Overview
This guide provides step-by-step instructions for testing the Super Admin access feature in the Nigeria Tax Calculator application.

## Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Access to the application (locally or deployed)
- Test account credentials

## Test Scenarios

### 1. Super Admin Login

#### Test Case 1.1: Successful Login
**Objective**: Verify that a user can log in as super admin with the correct password.

**Steps**:
1. Open the application in your browser
2. Complete the normal user login/signup process if required
3. Locate the "Super Admin" button in the header (red/pink colored button)
4. Click the "Super Admin" button
5. Enter the password: `aaaaaa`
6. Click "Login as Super Admin"

**Expected Result**:
- Success message: "Super Admin access granted!"
- Modal closes after ~800ms
- Alert appears: "Super Admin mode activated. You now have full access to all data and operations."
- Red "Super Admin" indicator pill appears in the header next to your username
- "Clear All" and "Delete User" buttons become enabled (no longer grayed out)

**Audit Trail**: Check audit trail report for entry: `superadmin.activated`

---

#### Test Case 1.2: Failed Login - Invalid Password
**Objective**: Verify that incorrect passwords are rejected.

**Steps**:
1. Click the "Super Admin" button
2. Enter an incorrect password (e.g., `wrongpass`)
3. Click "Login as Super Admin"

**Expected Result**:
- Error message: "Invalid super admin password."
- Modal remains open
- Super admin mode NOT activated
- No indicator pill appears
- Restricted buttons remain disabled

**Audit Trail**: Check audit trail report for entry: `superadmin.failed_login`

---

#### Test Case 1.3: Empty Password
**Objective**: Verify that empty password input is handled correctly.

**Steps**:
1. Click the "Super Admin" button
2. Leave password field empty
3. Click "Login as Super Admin"

**Expected Result**:
- Error message: "Please enter the super admin password."
- Modal remains open
- Super admin mode NOT activated

---

### 2. Super Admin Logout

#### Test Case 2.1: Logout from Super Admin Mode
**Objective**: Verify that a super admin can log out of super admin mode.

**Steps**:
1. Log in as super admin (follow Test Case 1.1)
2. Click the "Super Admin" button again (while logged in as super admin)
3. Confirm logout in the dialog

**Expected Result**:
- Confirmation dialog: "You are currently logged in as Super Admin. Do you want to logout from Super Admin mode?"
- After confirming: Alert message: "Super Admin mode deactivated."
- Red "Super Admin" indicator pill disappears
- "Clear All" and "Delete User" buttons become disabled again

**Audit Trail**: Check audit trail report for entry: `superadmin.deactivated`

---

### 3. Restricted Operations

#### Test Case 3.1: Clear All Data (Super Admin Only)
**Objective**: Verify that Clear All requires super admin access.

**Steps WITHOUT Super Admin**:
1. Make sure you are NOT logged in as super admin
2. Try to click "Clear All" button

**Expected Result**:
- Button should be disabled (grayed out) and not clickable
- If somehow clicked: Alert: "Super Admin access required to clear all data. Please login as Super Admin first."

**Steps WITH Super Admin**:
1. Log in as super admin
2. Click "Clear All" button
3. Confirm the first prompt
4. Confirm the second prompt

**Expected Result**:
- First confirmation: "Clear all stored data? This action cannot be undone!"
- Second confirmation: "Are you absolutely sure? This will delete ALL users, businesses, and transactions!"
- After confirming both: All data is cleared and demo data is reloaded
- Application resets to initial state

**Audit Trail**: Check audit trail report for entry: `data.clear_all`

---

#### Test Case 3.2: Delete User (Super Admin Only)
**Objective**: Verify that Delete User requires super admin access.

**Steps WITHOUT Super Admin**:
1. Make sure you are NOT logged in as super admin
2. Select a user from the user dropdown
3. Try to click "Delete" button next to user dropdown

**Expected Result**:
- Button should be disabled (grayed out) and not clickable
- If somehow clicked: Alert: "Super Admin access required to delete users. Please login as Super Admin first."

**Steps WITH Super Admin**:
1. Log in as super admin
2. Select a user from the user dropdown (not the current user)
3. Click "Delete" button
4. Confirm deletion

**Expected Result**:
- Confirmation dialog: "Delete user? This cannot be undone"
- After confirming: User is deleted
- User removed from dropdown
- Associated transactions deleted

**Audit Trail**: Check audit trail report for entry: `user.delete`

---

### 4. Visual Indicators

#### Test Case 4.1: Super Admin Indicator Visibility
**Objective**: Verify that the super admin indicator is shown/hidden correctly.

**Steps**:
1. When NOT logged in as super admin: Check header
2. Log in as super admin: Check header
3. Log out from super admin: Check header

**Expected Result**:
- NOT logged in: No red "Super Admin" pill visible
- Logged in: Red "Super Admin" pill visible with white text next to username
- After logout: Red pill disappears

---

#### Test Case 4.2: Button State Changes
**Objective**: Verify that button states change correctly based on super admin status.

**Steps**:
1. Before super admin login: Check "Clear All" and "Delete User" buttons
2. After super admin login: Check same buttons
3. After super admin logout: Check same buttons again

**Expected Result**:
- Before login: Both buttons appear disabled (faded/grayed with `.disabled` class)
- After login: Both buttons appear enabled (normal colors, no `.disabled` class)
- After logout: Both buttons return to disabled state

---

### 5. Security Warnings

#### Test Case 5.1: Security Warning in Modal
**Objective**: Verify that security warning is displayed to users.

**Steps**:
1. Click "Super Admin" button to open modal
2. Read the modal content

**Expected Result**:
- Yellow warning box at top: "⚠️ Super admin access allows viewing and editing ALL data."
- Security note at bottom with lock icon: "🔒 Security Note: This hardcoded password is for development/demo purposes only. In production, this feature should use environment variables or a secure authentication system."
- Warning text is clearly visible and emphasized

---

### 6. Audit Trail Verification

#### Test Case 6.1: Audit Trail Logging
**Objective**: Verify that all super admin actions are logged in the audit trail.

**Steps**:
1. Perform various super admin actions:
   - Log in as super admin
   - Delete a user (if logged in as super admin)
   - Clear all data (if logged in as super admin)
   - Log out from super admin
2. Navigate to Reports tab
3. Select "Audit Trail" report

**Expected Result**:
- All actions should be logged with entries:
  - `superadmin.activated` - when logging in
  - `superadmin.failed_login` - when wrong password entered
  - `user.delete` - when deleting a user
  - `data.clear_all` - when clearing all data
  - `superadmin.deactivated` - when logging out
- Each entry includes:
  - Timestamp
  - Action type
  - Entity type
  - Details description

---

### 7. Permission Boundary Testing

#### Test Case 7.1: Regular User Cannot Access Super Admin Features
**Objective**: Verify that regular users cannot bypass restrictions.

**Steps**:
1. Log in as a regular user (non-admin)
2. Try to access restricted features without super admin login

**Expected Result**:
- "Clear All" button is disabled
- "Delete User" button is disabled
- Cannot perform restricted operations
- Must use "Super Admin" button and correct password to gain access

---

#### Test Case 7.2: Admin User vs Super Admin
**Objective**: Verify distinction between Admin role and Super Admin access.

**Steps**:
1. Log in as a user with Admin role (isAdmin = true)
2. Check available operations
3. Log in as super admin
4. Compare available operations

**Expected Result**:
- **Admin (without super admin)**: 
  - Can manage businesses (add, edit, delete)
  - Can manage accounts
  - CANNOT delete users
  - CANNOT clear all data
  
- **Super Admin**:
  - All admin permissions PLUS
  - CAN delete users
  - CAN clear all data
  - Full access to everything

---

### 8. Session Persistence

#### Test Case 8.1: Super Admin Session Across Page Refresh
**Objective**: Verify that super admin status persists (or doesn't persist) correctly.

**Steps**:
1. Log in as super admin
2. Verify super admin indicator is visible
3. Refresh the page (F5 or Ctrl+R)
4. Check super admin status after page reload

**Expected Result**:
- **Current Implementation**: Super admin status PERSISTS across page refreshes (stored in localStorage)
- Super admin indicator still visible after refresh
- Restricted operations still enabled

**Note**: If session expiry is implemented, verify that super admin sessions expire correctly.

---

### 9. Edge Cases

#### Test Case 9.1: Multiple Super Admin Login Attempts
**Objective**: Verify behavior with multiple failed login attempts.

**Steps**:
1. Attempt to log in with wrong password 5 times
2. Then attempt with correct password

**Expected Result**:
- Each failed attempt shows error message
- Failed attempts are logged in audit trail
- Correct password still works after failures
- **Note**: Rate limiting is NOT implemented in current version

---

#### Test Case 9.2: Cancel Super Admin Login
**Objective**: Verify that canceling the login modal works correctly.

**Steps**:
1. Click "Super Admin" button to open modal
2. Enter password (or don't)
3. Click "Cancel" button

**Expected Result**:
- Modal closes
- Password field is cleared
- Error/success message is cleared
- Super admin mode NOT activated
- No changes to button states

---

## Test Data

### Test User Accounts
The application may have demo users pre-loaded. If not, create test accounts:

1. **Regular User**:
   - Username: `testuser`
   - No admin privileges

2. **Admin User**:
   - Username: `testadmin`
   - Has `isAdmin: true`

3. **Super Admin**:
   - Not a user account, but an access mode
   - Password: `aaaaaa`

---

## Automated Testing Checklist

- [ ] Super admin login with correct password succeeds
- [ ] Super admin login with incorrect password fails
- [ ] Super admin login with empty password shows error
- [ ] Super admin indicator appears when logged in
- [ ] Super admin indicator disappears when logged out
- [ ] Clear All button is disabled for non-super-admin users
- [ ] Clear All button is enabled for super admin
- [ ] Clear All function requires super admin confirmation
- [ ] Delete User button is disabled for non-super-admin users
- [ ] Delete User button is enabled for super admin
- [ ] Delete User function requires super admin confirmation
- [ ] All super admin actions are logged in audit trail
- [ ] Security warnings are displayed in the modal
- [ ] Cancel button works correctly in super admin modal
- [ ] Super admin logout deactivates mode correctly
- [ ] Button states update correctly on login/logout

---

## Security Testing Notes

### Things to Verify for Production Readiness

1. **Password Hardcoding**: 
   - ⚠️ Current password `aaaaaa` is HARDCODED
   - Must be changed to environment variable or secure service
   
2. **Rate Limiting**: 
   - ❌ NOT implemented
   - Should add to prevent brute force attacks
   
3. **Session Timeout**: 
   - ❌ NOT implemented
   - Should auto-logout after inactivity
   
4. **MFA**: 
   - ❌ NOT implemented
   - Should require multi-factor authentication
   
5. **IP Whitelisting**: 
   - ❌ NOT implemented
   - Should restrict access to known IPs

See SECURITY.md for complete security recommendations.

---

## Reporting Issues

If you find any issues during testing, report with:
1. Test case number
2. Steps to reproduce
3. Expected vs actual result
4. Screenshots if applicable
5. Browser and version
6. Console errors (if any)

---

## Success Criteria

The super admin feature is working correctly if:
- ✅ Correct password grants access
- ✅ Incorrect passwords are rejected
- ✅ Visual indicators work correctly
- ✅ Restricted operations are properly protected
- ✅ All actions are logged in audit trail
- ✅ Security warnings are visible
- ✅ Login/logout flows work smoothly
- ✅ No JavaScript errors in console

---

**Last Updated**: 2026-01-13
**Version**: 1.0.0
