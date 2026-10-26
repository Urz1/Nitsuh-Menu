const fs = require('fs');
const path = require('path');
const dns = require('dns');
const { Agent, setGlobalDispatcher } = require('undici');

setGlobalDispatcher(
  new Agent({
    connect: {
      lookup: (h, opt, cb) => dns.lookup(h, { ...opt, family: 4 }, cb),
    },
  })
);

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const cacheFilePath = path.join(__dirname, 'cloudinary-dishes-map.json');
let uploadMap = {};
if (fs.existsSync(cacheFilePath)) {
  try {
    uploadMap = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
  } catch {}
}

const dishesDir = path.join(process.cwd(), 'Dishes Pictures');
const files = fs.readdirSync(dishesDir);

async function uploadFile(fileName) {
  if (uploadMap[fileName]) {
    return uploadMap[fileName];
  }

  const filePath = path.join(dishesDir, fileName);
  try {
    const res = await cloudinary.uploader.upload(filePath, {
      folder: 'nitsuh-menu/dishes',
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });
    uploadMap[fileName] = res.secure_url;
    fs.writeFileSync(cacheFilePath, JSON.stringify(uploadMap, null, 2));
    console.log(`✓ Uploaded [${Object.keys(uploadMap).length}/${files.length}]: ${fileName} -> ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.error(`✗ Error uploading ${fileName}:`, err.message || err);
    return null;
  }
}

async function runBatch() {
  console.log(`Starting upload of ${files.length} dish photos to Cloudinary...`);
  const concurrency = 4;
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    await Promise.all(batch.map((f) => uploadFile(f)));
  }
  console.log(`\nAll files processed! Total in map: ${Object.keys(uploadMap).length}`);
}

runBatch().catch(console.error);
