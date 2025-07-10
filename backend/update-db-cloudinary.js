require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./src/models/User');
const Course = require('./src/models/Course');

const migrationLogPath = path.join(__dirname, 'migration-log.json');

async function updateUserFields(migrationMap) {
  let updated = 0;
  for (const [localPath, cloudUrl] of Object.entries(migrationMap)) {
    // Update cv
    const userCv = await User.updateMany({ cv: localPath }, { $set: { cv: cloudUrl } });
    if (userCv.modifiedCount > 0) {
      console.log(`User.cv updated: ${localPath} → ${cloudUrl}`);
      updated += userCv.modifiedCount;
    }
    // Update photo
    const userPhoto = await User.updateMany({ photo: localPath }, { $set: { photo: cloudUrl } });
    if (userPhoto.modifiedCount > 0) {
      console.log(`User.photo updated: ${localPath} → ${cloudUrl}`);
      updated += userPhoto.modifiedCount;
    }
  }
  return updated;
}

async function updateCourseFields(migrationMap) {
  let updated = 0;
  for (const [localPath, cloudUrl] of Object.entries(migrationMap)) {
    const course = await Course.updateMany({ thumbnail: localPath }, { $set: { thumbnail: cloudUrl } });
    if (course.modifiedCount > 0) {
      console.log(`Course.thumbnail updated: ${localPath} → ${cloudUrl}`);
      updated += course.modifiedCount;
    }
  }
  return updated;
}

async function main() {
  if (!fs.existsSync(migrationLogPath)) {
    console.error('❌ migration-log.json not found!');
    return;
  }
  const migrationLog = JSON.parse(fs.readFileSync(migrationLogPath, 'utf-8'));
  const migrationMap = {};
  migrationLog.results.forEach(entry => {
    // localPath: .../uploads/xxx/filename.ext → /uploads/xxx/filename.ext
    const relPath = entry.originalPath.split('uploads').pop();
    migrationMap[`/uploads${relPath.replace(/\\/g, '/')}`] = entry.cloudinaryUrl;
  });

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  let total = 0;
  total += await updateUserFields(migrationMap);
  total += await updateCourseFields(migrationMap);

  await mongoose.disconnect();
  console.log(`\n✅ Database update complete. Total fields updated: ${total}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Error updating database:', err);
    process.exit(1);
  });
} 