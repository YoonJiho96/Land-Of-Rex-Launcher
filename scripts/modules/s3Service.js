const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// S3 환경 변수
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET = process.env.S3_BUCKET_NAME;
const GAME_FOLDER = process.env.GAME_FOLDER_NAME;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

const s3 = new AWS.S3();

async function listGameObjects() {
  const params = {
    Bucket: S3_BUCKET,
    Prefix: `${GAME_FOLDER}/`,
  };
  return s3.listObjectsV2(params).promise();
}

function downloadFile(key, downloadPath) {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };
  const file = fs.createWriteStream(downloadPath);
  const s3Stream = s3.getObject(params).createReadStream();

  return new Promise((resolve, reject) => {
    s3Stream.pipe(file)
      .on('error', reject)
      .on('close', resolve);
  });
}

async function downloadGame(defaultDownloadPath, mainWindow) {
  const listedObjects = await listGameObjects();

  if (!listedObjects.Contents.length) {
    throw new Error('S3에 다운로드할 게임 폴더가 존재하지 않습니다.');
  }

  fs.mkdirSync(defaultDownloadPath, { recursive: true });

  for (let i = 0; i < listedObjects.Contents.length; i++) {
    const obj = listedObjects.Contents[i];
    const key = obj.Key;

    if (key.endsWith('/')) continue;

    const relativePath = key.substring(GAME_FOLDER.length + 1);
    const filePath = path.join(defaultDownloadPath, relativePath);

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await downloadFile(key, filePath);

    const progress = ((i + 1) / listedObjects.Contents.length) * 100;
    mainWindow.webContents.send('download-game-progress', { percent: progress.toFixed(2) });
  }

  mainWindow.webContents.send('download-complete');
}

async function downloadManifestFromS3() {
  const params = {
    Bucket: S3_BUCKET,
    Key: `game/manifest.json`
  };

  const data = await s3.getObject(params).promise();
  const manifestJson = data.Body.toString('utf-8');
  return JSON.parse(manifestJson);
}

module.exports = { downloadGame, downloadManifestFromS3, downloadFile };
