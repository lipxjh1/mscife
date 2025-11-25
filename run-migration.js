const { MongoClient } = require('mongodb');

async function runMigration() {
  const uri = 'mongodb://msci_game:Anhyeuem112529mscigamebackend2025@localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🚀 Starting migration...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('msci');
    const collection = db.collection('achievementconfigs');

    // Fragment to Hero mapping
    const fragmentToHero = {
      'anna_fragment_1': 'CHARACTER_ANNA_S1_L1',
      'anna_fragment_2': 'CHARACTER_ANNA_S2_L1', 
      'anna_fragment_3': 'CHARACTER_ANNA_S3_L1',
      'anna_fragment_4': 'CHARACTER_ANNA_S4_L1',
      'victoria_fragment_1': 'CHARACTER_VICTORIA_S1_L1',
      'victoria_fragment_2': 'CHARACTER_VICTORIA_S2_L1',
      'victoria_fragment_3': 'CHARACTER_VICTORIA_S1_L1',
      'victoria_fragment_4': 'CHARACTER_VICTORIA_S4_L1',
      'alexandra_fragment_1': 'CHARACTER_ALEXANDRA_S1_L1',
      'alexandra_fragment_2': 'CHARACTER_ALEXANDRA_S2_L1',
      'alexandra_fragment_3': 'CHARACTER_ALEXANDRA_S3_L1',
      'alexandra_fragment_4': 'CHARACTER_ALEXANDRA_S3_L1',
      'akane_fragment_1': 'CHARACTER_AKANE_S4_L1',
      'caitlyn_fragment_1': 'CHARACTER_JULIA_S1_L1'
    };

    // Find configs with fragments
    const configs = await collection.find({
      'rewards.item': { $regex: '_fragment_' }
    }).toArray();

    console.log(`📊 Found ${configs.length} achievements with fragment rewards`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const config of configs) {
      try {
        let updated = false;
        const newRewards = [];
        
        for (const reward of config.rewards) {
          if (reward.item && reward.item.includes('_fragment_')) {
            const heroCode = fragmentToHero[reward.item];
            if (heroCode) {
              console.log(`🔄 ${config.type}: ${reward.item} → ${heroCode}`);
              newRewards.push({
                item: heroCode,
                quantity: reward.quantity,
                _id: reward._id
              });
              updated = true;
            } else {
              newRewards.push(reward);
            }
          } else {
            newRewards.push(reward);
          }
        }
        
        if (updated) {
          // Update description
          if (config.descriptions && config.descriptions.length > 0) {
            let description = config.descriptions[0];
            description = description
              .replace('Akane Fragment 1', 'Akane 4 Star Level 1')
              .replace('Alice 1 Star level 1', 'Akane 4 Star Level 1')
              .replace('Anna Fragment 1', 'Anna 1 Star Level 1')
              .replace('Victorya 1 Star level 1', 'Victoria 1 Star Level 1')
              .replace('Victorya', 'Victoria')
              .replace(/Fragment/gi, 'Hero');
            config.descriptions[0] = description;
          }
          
          // Update in database
          const result = await collection.updateOne(
            { _id: config._id },
            { $set: { rewards: newRewards, descriptions: config.descriptions } }
          );
          
          if (result.modifiedCount > 0) {
            updatedCount++;
            console.log(`✅ Updated ${config.type}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error updating ${config.type}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Summary: ${updatedCount} updated, ${errorCount} errors`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected');
  }
}

runMigration();
