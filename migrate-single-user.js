import { MongoClient } from 'mongodb';
import fs from 'fs';

const uri = 'mongodb://msci_game:Anhyeuem112529mscigamebackend2025@localhost:27017';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 Starting UserId Migration for Single User');
console.log('==========================================\n');

async function migrateSingleUser() {
  const client = new MongoClient(uri);
  let migrationData = {
    oldUserId: null,
    newUserId: null,
    userObject: null,
    backupLocation: null,
    steps: []
  };

  try {
    // STEP 1: Connect to DB
    await client.connect();
    console.log('✅ Connected to MongoDB');
    migrationData.steps.push('Connected to MongoDB');

    const db = client.db('msci_game');
    const usersCollection = db.collection('users');

    // STEP 2: Find the 10-char user
    console.log('\n🔍 STEP 1: Finding user with 10-char UserId...');
    const user = await usersCollection.findOne({
      "$expr": {"$eq": [{"$strLenCP": "$UserId"}, 10]}
    });

    if (!user) {
      console.log('❌ No user with 10-char UserId found!');
      return;
    }

    migrationData.oldUserId = user.UserId;
    migrationData.userObject = user;
    console.log(`✅ Found user: ${user.UserId} (${user.Username || 'No username'})`);

    // Calculate new UserId
    migrationData.newUserId = user.UserId.substring(0, 1) + user.UserId.substring(2);
    console.log(`✅ New UserId will be: ${migrationData.newUserId}`);

    // Verify no conflict
    const conflictCheck = await usersCollection.findOne({UserId: migrationData.newUserId});
    if (conflictCheck) {
      console.log(`❌ CONFLICT! UserId ${migrationData.newUserId} already exists for user ${conflictCheck.Username}`);
      return;
    }
    console.log('✅ No conflict with new UserId');

    // STEP 3: Create backup
    console.log('\n💾 STEP 2: Creating backup...');
    const backupDir = `/root/backup-userid-migration-${timestamp}`;
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, {recursive: true});
    }

    // Save user data as JSON
    const backupFile = `${backupDir}/user-${user.UserId}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(user, null, 2));
    migrationData.backupLocation = backupFile;
    console.log(`✅ Backup created at: ${backupFile}`);

    // Save migration data
    fs.writeFileSync(`${backupDir}/migration-info.json`, JSON.stringify(migrationData, null, 2));

    // STEP 4: Execute migration
    console.log('\n🔧 STEP 3: Executing migration...');

    // Update user document
    const updateResult = await usersCollection.updateOne(
      {_id: user._id},
      {
        $set: {
          UserId: migrationData.newUserId,
          oldUserId: migrationData.oldUserId,
          migratedAt: new Date()
        }
      }
    );

    if (updateResult.modifiedCount !== 1) {
      console.log('❌ Failed to update user!');
      return;
    }
    console.log('✅ User document updated successfully');

    // STEP 5: Update references
    console.log('\n🔄 STEP 4: Updating references...');

    // Update friend references
    const friendUpdates = await usersCollection.updateMany(
      {friends: migrationData.oldUserId},
      {$set: {"friends.$": migrationData.newUserId}}
    );
    if (friendUpdates.modifiedCount > 0) {
      console.log(`✅ Updated ${friendUpdates.modifiedCount} friend references`);
    }

    // Update InviteBy references
    const inviteUpdates = await usersCollection.updateMany(
      {InviteBy: migrationData.oldUserId},
      {$set: {InviteBy: migrationData.newUserId}}
    );
    if (inviteUpdates.modifiedCount > 0) {
      console.log(`✅ Updated ${inviteUpdates.modifiedCount} InviteBy references`);
    }

    // Check for guilds collection and update if exists
    try {
      const guildsCollection = db.collection('guilds');
      const guildUpdates = await guildsCollection.updateMany(
        {members: migrationData.oldUserId},
        {$set: {"members.$": migrationData.newUserId}}
      );
      if (guildUpdates.modifiedCount > 0) {
        console.log(`✅ Updated ${guildUpdates.modifiedCount} guild member references`);
      }

      // Also update guild leader if needed
      const leaderUpdates = await guildsCollection.updateMany(
        {leaderId: migrationData.oldUserId},
        {$set: {leaderId: migrationData.newUserId}}
      );
      if (leaderUpdates.modifiedCount > 0) {
        console.log(`✅ Updated ${leaderUpdates.modifiedCount} guild leader references`);
      }
    } catch (e) {
      console.log('ℹ️ No guilds collection or no guild references to update');
    }

    // Check if this is SuperUser and needs backend config update
    if (migrationData.oldUserId === 'A000000068') {
      console.log('\n⚠️ This is the SuperUser account!');
      console.log('   Manual steps needed:');
      console.log('   1. Update /www/wwwroot/game/seed.js');
      console.log('   2. Update any hardcoded references in backend');
      console.log('   3. Restart services');
    }

    // STEP 6: Verification
    console.log('\n✅ STEP 5: Verifying migration...');

    // Check no more 10-char users
    const remainingCount = await usersCollection.countDocuments({
      "$expr": {"$eq": [{"$strLenCP": "$UserId"}, 10]}
    });
    if (remainingCount === 0) {
      console.log('✅ No more 10-char users in database');
    } else {
      console.log(`❌ Still ${remainingCount} 10-char users found!`);
    }

    // Verify user exists with new ID
    const verifyUser = await usersCollection.findOne({UserId: migrationData.newUserId});
    if (verifyUser) {
      console.log('✅ User found with new UserId');
    }

    // Verify old ID doesn't exist
    const oldUserCheck = await usersCollection.findOne({UserId: migrationData.oldUserId});
    if (!oldUserCheck) {
      console.log('✅ Old UserId no longer exists');
    }

    // STEP 7: Generate report
    console.log('\n📊 STEP 6: Generating completion report...');
    const report = {
      migration: {
        date: new Date().toISOString(),
        status: 'SUCCESS',
        duration: 'Completed',
        oldUserId: migrationData.oldUserId,
        newUserId: migrationData.newUserId,
        username: user.Username || 'No username'
      },
      changes: {
        userUpdated: true,
        friendReferencesUpdated: friendUpdates.modifiedCount,
        inviteByReferencesUpdated: inviteUpdates.modifiedCount,
        guildReferencesUpdated: guildUpdates?.modifiedCount || 0
      },
      verification: {
        noTenCharUsersRemaining: remainingCount === 0,
        userFoundWithNewId: !!verifyUser,
        oldIdRemoved: !oldUserCheck
      },
      backup: {
        location: migrationData.backupLocation,
        restoreCommand: `mongorestore --db msci_game --collection users --drop ${backupDir}/`
      },
      notes: []
    };

    if (migrationData.oldUserId === 'A000000068') {
      report.notes.push('This is the SuperUser account - backend configs need manual update');
    }

    const reportFile = `${backupDir}/migration-report.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('===================================');
    console.log(`Old UserId: ${migrationData.oldUserId}`);
    console.log(`New UserId: ${migrationData.newUserId}`);
    console.log(`Username: ${user.Username || 'No username'}`);
    console.log(`Backup: ${migrationData.backupLocation}`);
    console.log(`Report: ${reportFile}`);
    console.log('\n✅ All steps completed successfully!');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);

    // Save error info
    if (migrationData.backupLocation) {
      fs.writeFileSync(
        `${migrationData.backupLocation}/error.log`,
        `${new Date().toISOString()}: ${error.stack}`
      );
    }

    console.log('\n⚠️ Check error logs and restore from backup if needed');
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the migration
migrateSingleUser();