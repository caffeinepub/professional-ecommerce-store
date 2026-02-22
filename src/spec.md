# Professional Ecommerce Store

## Current State

The authorization system uses a token-based approach where the first user who provides the correct admin token becomes admin. However:
- The token system is not being used correctly in the frontend
- There's no clear way to determine who the first user is
- The frontend has a workaround that checks if products exist to determine admin status

The current authorization flow:
1. Backend has `initialize()` function that requires an admin token
2. Frontend doesn't call this function properly
3. Frontend uses a workaround checking if the user is logged in and no products exist

## Requested Changes (Diff)

### Add
- Backend function to automatically assign the **first logged-in user** as admin (no token required)
- Backend function to check if admin has been assigned yet
- Frontend logic to properly integrate with the new backend admin assignment

### Modify
- **Backend**: Update authorization module to track if admin has been assigned
- **Backend**: Create a new `registerUser()` function that automatically assigns admin to the first caller
- **Frontend**: Remove the workaround logic and use proper backend calls to determine admin status

### Remove
- Token-based admin initialization (no longer needed)
- Frontend workaround that checks product count to determine admin status

## Implementation Plan

**Backend Changes:**
1. Update `access-control.mo` to add a `registerUser()` function that:
   - Checks if `adminAssigned` is false
   - If false, assigns caller as admin and sets `adminAssigned = true`
   - If true, assigns caller as regular user
2. Add query function `isAdminAssigned()` to check if admin exists
3. Add query function `getCallerRole()` so frontend can check user's role
4. Update `MixinAuthorization.mo` to expose these new functions

**Frontend Changes:**
1. Create a hook or utility to call `registerUser()` when user first logs in
2. Update admin detection to use `getCallerRole()` from backend instead of the workaround
3. Update Header component to show admin badge based on backend role
4. Update AdminPage to verify admin status with backend

## UX Notes

- **First user wins**: The very first person to log in becomes the permanent admin
- **Automatic**: No manual configuration or token needed
- **Secure**: Admin status is tracked in the backend canister state, not the frontend
- **Clear indication**: Admin sees their gold badge and confirmation banner
- **Persistent**: Admin status survives canister upgrades (stored in stable state)
