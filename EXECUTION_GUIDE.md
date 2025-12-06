# UserId Migration - Execution Guide

## 📋 Overview
Only **1 user** needs to be migrated from 10-char to 9-char UserId. This is a very low-risk operation.

## 🚀 Quick Execution

### Step 1: Upload Scripts to Server
```bash
# Upload these files to the server:
- migrate-single-user.js
- verify-migration.js
```

### Step 2: Run Migration
```bash
# Navigate to where scripts are uploaded
cd /path/to/scripts

# Execute migration
node migrate-single-user.js
```

### Step 3: Verify Migration
```bash
# Run verification
node verify-migration.js
```

## 📊 Expected Results

Based on our analysis:
- Total users: 14,446
- Users to migrate: 1 (0.01%)
- Migration risk: VERY LOW

## ⚠️ Important Notes

1. **Backup is automatically created** by the migration script
2. **All references are updated** (friends, invites, guilds)
3. **Verification is included** to ensure success
4. **Rollback is possible** using the backup

## 🔧 If This is the SuperUser

If the migrated user is `A000000068` (SuperUser):
1. Migration script will warn you
2. Manual steps needed after migration:
   ```bash
   # Update seed.js
   sed -i 's/A000000068/A00000068/g' /www/wwwroot/game/seed.js

   # Restart services
   pm2 restart all
   ```

## 🎯 Success Criteria

Migration is successful when:
- ✅ No 10-char UserIds remain
- ✅ All references updated
- ✅ Services running normally
- ✅ No errors in logs

## 📞 Rollback (if needed)

If something goes wrong:
```bash
# Find backup location (shown in migration output)
# Example: /root/backup-userid-migration-2025-01-02T10-30-00-000Z/

# Restore
mongorestore --db msci_game --collection users --drop /path/to/backup/

# Restart services
pm2 restart all
```

## ⏱️ Estimated Time

- Migration: 2-5 minutes
- Verification: 1 minute
- Total: ~5-10 minutes

---

## ✅ Ready to Execute

The migration scripts are prepared and ready. Simply run them on the server to complete the migration of the single user from 10-char to 9-char UserId.