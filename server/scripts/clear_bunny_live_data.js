import pool from '../db.js';

async function cleanupBunnyLiveData() {
  console.log('--- Starting Live Stream Database Cleanup & Schema Migration ---');
  const conn = await pool.getConnection();
  try {
    // 1. Check if bunny_stream_id exists on live_classes, and rename or add stream_id
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'live_classes'
    `);
    const colNames = columns.map(c => c.COLUMN_NAME);

    // If stream_id does not exist, add it
    if (!colNames.includes('stream_id')) {
      if (colNames.includes('bunny_stream_id')) {
        console.log('Migrating live_classes: renaming bunny_stream_id to stream_id...');
        await conn.query(`
          ALTER TABLE live_classes 
          CHANGE COLUMN bunny_stream_id stream_id VARCHAR(100) NULL
        `);
      } else {
        console.log('Adding stream_id column to live_classes...');
        await conn.query(`
          ALTER TABLE live_classes 
          ADD COLUMN stream_id VARCHAR(100) NULL AFTER status
        `);
      }
    } else if (colNames.includes('bunny_stream_id')) {
      // If both exist, drop bunny_stream_id
      console.log('Dropping redundant bunny_stream_id column from live_classes...');
      await conn.query(`ALTER TABLE live_classes DROP COLUMN bunny_stream_id`);
    }

    // Ensure rtmp_url column exists on live_classes
    if (!colNames.includes('rtmp_url')) {
      console.log('Adding rtmp_url column to live_classes...');
      await conn.query(`
        ALTER TABLE live_classes 
        ADD COLUMN rtmp_url VARCHAR(500) NULL AFTER stream_key
      `);
    }

    // 2. Clear test live classes data (foreign keys CASCADE to live_class_batches, live_polls, live_poll_responses)
    console.log('Purging test live stream data from live_classes...');
    const [delClasses] = await conn.query('DELETE FROM live_classes');
    console.log(`Deleted ${delClasses.affectedRows} rows from live_classes.`);

    // 3. Clear live class replay test entries from video_lectures
    console.log('Purging live class test replay entries from video_lectures...');
    const [delReplays] = await conn.query(`
      DELETE FROM video_lectures 
      WHERE chapter = 'Live Class Recordings' 
         OR title LIKE '%(Live Class Replay)%'
         OR description LIKE '%Recorded session from live classroom%'
    `);
    console.log(`Deleted ${delReplays.affectedRows} test replay rows from video_lectures.`);

    console.log('--- Live Stream Database Cleanup Completed Successfully ---');
  } catch (err) {
    console.error('Error during live stream cleanup:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

cleanupBunnyLiveData();
