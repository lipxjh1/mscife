import { MongoClient } from 'mongodb';

async function analyzeUserIdImpact() {
  const uri = 'mongodb://msci_game:Anhyeuem112529mscigamebackend2025@localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔍 Starting UserId Migration Impact Analysis...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('msci_game');
    const usersCollection = db.collection('users');

    console.log('\n📊 PHASE 1: COUNT USERS BY LENGTH');
    console.log('=====================================');

    // Count users by UserId length
    const lengthStats = await usersCollection.aggregate([
      { $project: { UserId: 1, length: { $strLenCP: "$UserId" } } },
      { $group: { _id: "$length", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('Users by UserId length:');
    lengthStats.forEach(stat => {
      console.log(`  ${stat._id} chars: ${stat.count} users`);
    });

    const totalUsers = await usersCollection.countDocuments({});
    console.log(`\nTotal users: ${totalUsers}`);

    console.log('\n📊 PHASE 2: LIST 10-CHAR USERS');
    console.log('===============================');

    // Get 10-char users
    const tenCharUsers = await usersCollection.find({
      UserId: { $regex: "^A[0-9]{9}$" }  // A + 9 digits = 10 chars
    }).limit(20).toArray();

    console.log(`\nFound ${tenCharUsers.length} 10-char users (sample):`);
    tenCharUsers.forEach(user => {
      console.log(`  ${user.UserId} - ${user.Username || 'No username'} - Created: ${user.createdAt} - VIP: ${user.isVip || false}`);
    });

    // Check for VIP users with 10-char
    const vipTenCharUsers = await usersCollection.find({
      UserId: { $regex: "^A[0-9]{9}$" },
      isVip: true
    }).toArray();

    console.log(`\nVIP users with 10-char UserId: ${vipTenCharUsers.length}`);
    vipTenCharUsers.forEach(user => {
      console.log(`  ${user.UserId} - ${user.Username} - VIP expires: ${user.vipExpiryDate}`);
    });

    console.log('\n📊 PHASE 3: CHECK FOR CONFLICTS');
    console.log('===============================');

    // Check specific potential conflicts
    const conflicts = [];
    for (const user of tenCharUsers.slice(0, 10)) {
      const userId10 = user.UserId;
      const userId9 = userId10.substring(0, 9); // Remove last char

      const existing9Char = await usersCollection.findOne({ UserId: userId9 });
      if (existing9Char) {
        conflicts.push({
          userId10: userId10,
          userId9: userId9,
          user10Name: user.Username,
          user9Name: existing9Char.Username
        });
      }
    }

    if (conflicts.length > 0) {
      console.log(`\n⚠️ Found ${conflicts.length} potential conflicts:`);
      conflicts.forEach(conflict => {
        console.log(`  ${conflict.userId10} (${conflict.user10Name}) → ${conflict.userId9} (${conflict.user9Name})`);
      });
    } else {
      console.log('\n✅ No conflicts found in checked samples');
    }

    console.log('\n📊 PHASE 4: CHECK PENDING TRANSACTIONS');
    console.log('===================================');

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Check for deposits/transactions
    const depositCollections = collections.filter(c => c.name.includes('deposit') || c.name.includes('transaction'));

    if (depositCollections.length > 0) {
      for (const col of depositCollections) {
        console.log(`\nChecking ${col.name} collection:`);
        const coll = db.collection(col.name);
        const pendingCount = await coll.countDocuments({ status: 'pending' });
        console.log(`  Pending transactions: ${pendingCount}`);

        if (pendingCount > 0) {
          const pendingSamples = await coll.find({ status: 'pending' }).limit(5).toArray();
          pendingSamples.forEach(pending => {
            console.log(`    - ${pending.UserId || pending.userId}: ${pending.amount} ${pending.status}`);
          });
        }
      }
    }

    console.log('\n📊 PHASE 5: CHECK REFERENCES');
    console.log('============================');

    // Check guilds if exists
    if (collections.find(c => c.name === 'guilds')) {
      console.log('\nChecking guilds collection:');
      const guilds = db.collection('guilds');
      const guildsWithTenChar = await guilds.find({
        $or: [
          { leaderId: { $regex: "^A[0-9]{9}$" } },
          { members: { $regex: "A[0-9]{9}" } }
        ]
      }).toArray();

      console.log(`  Guilds with 10-char UserIds: ${guildsWithTenChar.length}`);
    }

    // Check friend relationships
    const usersWithFriends = await usersCollection.find({
      friends: { $exists: true, $ne: [] }
    }).limit(5).toArray();

    console.log(`\nSample users with friends: ${usersWithFriends.length}`);
    usersWithFriends.forEach(user => {
      const tenCharFriends = (user.friends || []).filter(f => f.match(/^A[0-9]{9}$/));
      if (tenCharFriends.length > 0) {
        console.log(`  ${user.UserId} has ${tenCharFriends.length} 10-char friends`);
      }
    });

    // Check referrals
    const usersWithReferrals = await usersCollection.find({
      InviteBy: { $exists: true, $ne: "" }
    }).toArray();

    const tenCharReferrals = usersWithReferrals.filter(u => u.InviteBy && u.InviteBy.match(/^A[0-9]{9}$/));
    console.log(`\nUsers with 10-char referrers: ${tenCharReferrals.length}`);

    console.log('\n📊 SUMMARY REPORT');
    console.log('=================');

    const tenCharCount = await usersCollection.countDocuments({
      UserId: { $regex: "^A[0-9]{9}$" }
    });

    const nineCharCount = await usersCollection.countDocuments({
      UserId: { $regex: "^A[0-9]{8}$" }
    });

    console.log(`\nUser Distribution:`);
    console.log(`  9-char UserIds: ${nineCharCount} (${((nineCharCount/totalUsers)*100).toFixed(2)}%)`);
    console.log(`  10-char UserIds: ${tenCharCount} (${((tenCharCount/totalUsers)*100).toFixed(2)}%)`);

    console.log(`\nMigration Impact:`);
    console.log(`  Users to migrate: ${tenCharCount}`);
    console.log(`  Conflicts found: ${conflicts.length}`);
    console.log(`  VIP users affected: ${vipTenCharUsers.length}`);

    console.log(`\n⚠️ MIGRATION RISK ASSESSMENT:`);
    if (tenCharCount === 0) {
      console.log(`  ✅ NO MIGRATION NEEDED - All users already have 9-char UserIds`);
    } else if (tenCharCount < 10 && conflicts.length === 0) {
      console.log(`  ✅ LOW RISK - Only ${tenCharCount} users to migrate, no conflicts`);
    } else if (conflicts.length > 0) {
      console.log(`  ❌ HIGH RISK - ${conflicts.length} conflicts found! Migration not recommended without conflict resolution`);
    } else if (vipTenCharUsers.length > 0) {
      console.log(`  ⚠️ MEDIUM RISK - ${vipTenCharUsers.length} VIP users will be affected`);
    } else {
      console.log(`  ⚠️ MEDIUM RISK - ${tenCharCount} users to migrate`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

analyzeUserIdImpact();