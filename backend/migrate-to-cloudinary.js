require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsDir = path.join(__dirname, 'uploads');

// Migration mapping
const migrationMap = {
  'course-images': {
    folder: 'lms/course-images',
    transformations: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto' }
    ]
  },
  'lesson-materials': {
    folder: 'lms/lesson-materials',
    transformations: []
  },
  'cv': {
    folder: 'lms/cv',
    transformations: []
  },
  'photo': {
    folder: 'lms/photos',
    transformations: [
      { width: 300, height: 300, crop: 'fill' },
      { quality: 'auto' }
    ]
  }
};

async function uploadFileToCloudinary(filePath, category) {
  try {
    const config = migrationMap[category];
    const fileName = path.basename(filePath, path.extname(filePath));
    const publicId = `${config.folder}/${fileName}`;

    console.log(`📤 Uploading: ${path.basename(filePath)} to ${publicId}`);

    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      folder: config.folder,
      transformation: config.transformations,
      resource_type: 'auto'
    });

    console.log(`✅ Success: ${result.secure_url}`);
    return {
      originalPath: filePath,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      category: category
    };
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error.message);
    return null;
  }
}

async function migrateCategory(category) {
  const categoryDir = path.join(uploadsDir, category);
  
  if (!fs.existsSync(categoryDir)) {
    console.log(`📁 Category ${category} not found, skipping...`);
    return [];
  }

  const files = fs.readdirSync(categoryDir);
  console.log(`\n🔄 Migrating ${category}: ${files.length} files`);

  const results = [];
  for (const file of files) {
    if (file === '.gitkeep') continue;
    
    const filePath = path.join(categoryDir, file);
    const result = await uploadFileToCloudinary(filePath, category);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

async function migrateAllFiles() {
  console.log('🚀 Starting migration to Cloudinary...\n');

  const allResults = [];
  const categories = Object.keys(migrationMap);

  for (const category of categories) {
    const results = await migrateCategory(category);
    allResults.push(...results);
  }

  // Save migration results
  const migrationLog = {
    timestamp: new Date().toISOString(),
    totalFiles: allResults.length,
    results: allResults
  };

  fs.writeFileSync(
    path.join(__dirname, 'migration-log.json'),
    JSON.stringify(migrationLog, null, 2)
  );

  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Total files migrated: ${allResults.length}`);
  console.log(`📝 Log saved to: migration-log.json`);

  return allResults;
}

// Function to update database records (optional)
async function updateDatabaseRecords(migrationResults) {
  console.log('\n🔄 Updating database records...');
  
  // This would need to be implemented based on your database structure
  // For now, we'll just log the results
  migrationResults.forEach(result => {
    console.log(`📝 Update DB: ${result.originalPath} → ${result.cloudinaryUrl}`);
  });
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking Cloudinary configuration...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'Not set');

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary configuration missing! Check your .env file.');
      return;
    }

    const results = await migrateAllFiles();
    
    if (results.length > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Review migration-log.json for details');
      console.log('2. Update database records with new Cloudinary URLs');
      console.log('3. Test file access from Cloudinary');
      console.log('4. Remove local uploads folder (optional)');
    } else {
      console.log('\n⚠️ No files found to migrate.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { migrateAllFiles, updateDatabaseRecords }; 