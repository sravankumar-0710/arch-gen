# ArchGen AI - Testing Guide

**Purpose**: Complete guide to running tests
**Last Updated**: 2026-03-20

---

## Quick Start

### Start Backend
```bash
cd /c/Users/User/Desktop/archgen-ai
python -B run_backend.py
```

### Run Full Integration Test
```bash
cd /c/Users/User/Desktop/archgen-ai
python -B tests/FULL_INTEGRATION_TEST.py
```

Expected: ALL PHASES CONNECTED AND WORKING PERFECTLY

### Run Phase 5 Test Only
```bash
python -B tests/PHASE_5_TEST.py
```

Expected: SUCCESS - All variants are different!

---

## Test Files

File: tests/FULL_INTEGRATION_TEST.py
- Tests all 5 phases integrated
- ~8 seconds duration
- 28 total assertions

File: tests/PHASE_5_TEST.py
- Tests layout generation specifically
- ~2 seconds duration
- Verifies variant differentiation

---

## What Gets Tested

### Phase 1: Backend
- Health check endpoint
- Server responsiveness

### Phase 2: Auth
- User registration
- User login
- JWT token generation
- Token validation

### Phase 3: Land Input
- Save polygon points
- Save unit system
- Save north angle
- Retrieve and verify data

### Phase 4: Projects
- Create project
- List projects
- Get project details
- Update project
- User ownership

### Phase 5: Layout Generation
- Generate 3+ variants
- Variant differentiation
- Wall generation (15 per layout)
- Door placement (5 per layout)
- Window placement (8 per layout)
- Vastu scoring (0-100%)

---

## Manual Test with cURL

Get token:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

Generate layout:
```bash
curl -X POST http://localhost:8000/generate \
  -H "Authorization: Bearer TOKEN" \
  -d '{"land_data":{...},"requirements":{...}}'
```

---

## Troubleshooting

Backend won't start:
- Check if port 8000 in use
- Check /tmp/backend.log for errors

Test "Connection refused":
- Backend not running
- Check backend startup

Test "Plot area too small":
- Use larger polygon coordinates
- Use (50,50) to (350,350) range

---

## Test Results

All tests passing: ✓
- Phase 1: ✓ PASSED
- Phase 2: ✓ PASSED
- Phase 3: ✓ PASSED
- Phase 4: ✓ PASSED
- Phase 5: ✓ PASSED (100% - COMPLETE)

Total: 28/28 tests passed

---

**Last Verified**: 2026-03-20
