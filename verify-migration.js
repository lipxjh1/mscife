import { MongoClient } from 'mongodb';

const uri = 'mongodb://msci_game:Anhyeuem112529mscigamebackend2025@localhost:27017';

async function verifyMigration() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('msci_game');
    const usersCollection = db.collection('users');

    console.log('\n📊 UserId Length Distribution:');
    console.log('===============================');

    // Count by length
    const lengthStats = await usersCollection.aggregate([
      { $project: { UserId: 1, length: { $strLenCP: "$UserId" } } },
      { $group: { _id: "$length", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    lengthStats.forEach(stat => {
      const status = stat._id === 10 ? '❌ PROBLEM' : '✅ OK';
      console.log(`  ${stat._id} chars: ${stat.count} users ${status}`);
    });

    // Check for migrated user
    console.log('\n🔍 Checking for Migrated Users:');
    console.log('===============================');

    const migratedUsers = await usersCollection.find({
      oldUserId: { $exists: true }
    }).toArray();

    if (migratedUsers.length > 0) {
      console.log(`✅ Found ${migratedUsers.length} migrated users:`);
      migratedUsers.forEach(user => {
        console.log(`  ${user.oldUserId} → ${user.UserId} (${user.Username || 'No username'})`);
      });
    } else {
      console.log('ℹ️ No migrated users found with oldUserId field');
    }

    // Check for any remaining references
    console.log('\n🔍 Checking for Old References:');
    console.log('===============================');

    const tenCharPattern = /^A[0-9]{9}$/; // Pattern for 10-char UserIds

    // Check friends
    const friendsWithOldRef = await usersCollection.countDocuments({
      friends: tenCharPattern
    });
    console.log(`Friend references with 10-char: ${friendsWithOldRef}`);

    // Check InviteBy
    const invitesWithOldRef = await usersCollection.countDocuments({
      InviteBy: tenCharPattern
    });
    console.log(`InviteBy references with 10-char: ${invitesWithOldRef}`);

    // Final status
    const hasTenChar = lengthStats.some(s => s._id === 10 && s.count > 0);
    const hasOldRefs = friendsWithOldRef > 0 || invitesWithOldRef > 0;

    console.log('\n🎯 FINAL VERIFICATION STATUS:');
    console.log('=============================');

    if (!hasTenChar && !hasOldRefs) {
      console.log('✅ MIGRATION SUCCESSFUL!');
      console.log('   - No 10-char UserIds remaining');
      console.log('   - No old references found');
      console.log('   - All users have 9-char UserIds');
    } else {
      console.log('⚠️ MIGRATION INCOMPLETE:');
      if (hasTenChar) {
        console.log('   - Still have 10-char UserIds in database');
      }
      if (hasOldRefs) {
        console.log('   - Still have old references in friends/invites');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

verifyMigration();