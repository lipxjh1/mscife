import { MongoClient } from 'mongodb';

const uri = 'mongodb://msci_game:Anhyeuem112529mscigamebackend2025@localhost:27017';

async function findUser() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('msci_game');
    const usersCollection = db.collection('users');

    // Find the user with 10-char UserId
    const user = await usersCollection.findOne({
      "$expr": {"$eq": [{"$strLenCP": "$UserId"}, 10]}
    });

    if (user) {
      console.log('✅ Found user with 10-char UserId:');
      console.log('================================');
      console.log(`UserId: ${user.UserId}`);
      console.log(`Username: ${user.Username || 'N/A'}`);
      console.log(`Email: ${user.Email || 'N/A'}`);
      console.log(`TelegramId: ${user.TelegramId || 'N/A'}`);
      console.log(`_id: ${user._id}`);
      console.log(`isVip: ${user.isVip || false}`);
      console.log(`lastLogin: ${user.lastLogin || 'N/A'}`);
      console.log(`MSCI: ${user.MSCI || 0}`);
      console.log(`Musk: ${user.Musk || 0}`);
      console.log(`Chip: ${user.Chip || 0}`);
      console.log(`createdAt: ${user.createdAt}`);

      // Check if it's SuperUser
      if (user.UserId === 'A000000068') {
        console.log('\n⚠️ WARNING: This is the SuperUser account!');
      }

      // Check length to confirm
      console.log(`\nUserId length: ${user.UserId.length} chars`);

      // Calculate new UserId
      const newUserId = user.UserId.substring(0, 1) + user.UserId.substring(2);
      console.log(`New UserId will be: ${newUserId} (${newUserId.length} chars)`);
    } else {
      console.log('❌ No user with 10-char UserId found');
    }

    // Double check count
    const count = await usersCollection.countDocuments({
      "$expr": {"$eq": [{"$strLenCP": "$UserId"}, 10]}
    });
    console.log(`\nTotal 10-char users: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

findUser();