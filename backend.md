# Backend Changes — E-Governance AgriHub

## 1. Auth Controller — Error Status Code Fix

**File:** `backend/src/controllers/auth.controller.js`

The error handling in auth controller was always returning HTTP 500 regardless of the actual error. Changed from hardcoded `500` to pass through the error's own status code:

```js
// Before
res.status(500).json({ success: false, message: err.message });

// After
res.status(err.statusCode || 500).json({ success: false, message: err.message });
```

## 2. Mongoose Model ID Generators — `pre(/^find/)` Middleware Bypass

**Files:**
- `backend/src/models/Farmer.js` — `generateFarmerId()`
- `backend/src/models/Produce.js` — `generateProduceId()`
- `backend/src/models/Transaction.js` — `generateTransactionId()`
- `backend/src/models/ProduceVerification.js` — `generateVerificationId()`

### Problem
All models have:
```js
schema.pre(/^find/, function () {
  this.find({ isActive: { $ne: false } });
});
```
This regex matches `find()`, `findOne()`, `findById()`, `findOneAndUpdate()`, etc., and automatically filters out soft-deleted documents (`isActive: false`). When the ID generators used `this.find()` to find the max existing ID, they could not see inactive documents, leading to duplicate IDs.

### Fix
Replaced `this.find()` with `this.collection.find()` (native MongoDB driver, bypasses Mongoose middleware):

```js
// Before
const docs = await this.find({ transactionId: { $exists: true } }).sort({ transactionId: -1 }).limit(1);

// After
const docs = await this.collection.find(
  { transactionId: { $exists: true } },
  { projection: { transactionId: 1, _id: 0 } }
).toArray();
```

Also changed the sort-based "find last" approach to an explicit max-numeric-ID scan using `parseInt()`:

```js
let maxNum = 0;
for (const d of docs) {
  const num = parseInt(d.transactionId.replace('TXN-', ''), 10);
  if (!isNaN(num) && num > maxNum) maxNum = num;
}
const nextNum = maxNum + 1;
return `TXN-${String(nextNum).padStart(3, '0')}`;
```

## 3. Seed Data — Admin Name and Test Accounts

**File:** `backend/src/seed/seed.js`

### Admin name
Changed from **"James Mugisha"** to **"Wandera Jonah"** to match the current administrator.

### Test credentials for all three RBAC roles

| Role | Name | Email | Password |
|------|------|-------|----------|
| Administrator | Wandera Jonah | admin@agrihub.com | admin123 |
| Market Officer | Sarah Tendo | officer@agrihub.com | officer123 |
| Government Officer | David Okello | gov@agrihub.com | gov123 |

Also kept the original seed users (Agnes Nalwoga, Robert Kiggundu) for data variety. Old produce-inspector role user removed.

## 4. README Credentials Updated

**File:** `backend/README.md`

Credentials table updated to reflect the new test accounts and the Wandera Jonah name.

## 5. Backend Infrastructure Notes

- **Port:** 5000
- **MongoDB:** localhost:27017 / agrihub
- **Auth:** JWT with `protect` middleware + `authorize(...roles)` middleware
- **User Model enum:** `['Administrator', 'Market Officer', 'Produce Inspector', 'Government Officer']`
- **User route protection:** all user CRUD routes require `authorize('Administrator')`
- **Seed command:** `cd backend && node -r dotenv/config src/seed/seed.js dotenv_config_path=.env`
