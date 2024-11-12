const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 파일 해시 계산 함수
function calculateFileHash(filePath) {
    const hash = crypto.createHash('md5');
    const fileData = fs.readFileSync(filePath);
    hash.update(fileData);
    return hash.digest('hex');
}

// 디렉터리 크기 및 해시 계산 함수
function calculateDirectorySizeAndHash(directory) {
    let totalSize = 0;
    const hash = crypto.createHash('md5');

    // 파일을 정렬하여 일관된 해시 값 유지
    const filesAndDirs = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

    filesAndDirs.forEach(dirent => {
        const fullPath = path.join(directory, dirent.name);

        if (dirent.isDirectory()) {
            // 재귀적으로 하위 디렉터리 크기와 해시 계산
            const { size, dirHash } = calculateDirectorySizeAndHash(fullPath);
            totalSize += size;
            hash.update(dirHash);
        } else {
            const fileSize = fs.statSync(fullPath).size;
            const fileHash = calculateFileHash(fullPath);
            totalSize += fileSize;
            hash.update(fileHash);
            hash.update(fileSize.toString());
        }
    });

    return { size: totalSize, dirHash: hash.digest('hex') };
}

// manifest 생성 함수
function generateFileManifest(directory) {
    const manifest = { directories: [], files: [] };

    // 최상위 디렉터리 크기와 해시 값을 계산하여 저장
    const { size, dirHash } = calculateDirectorySizeAndHash(directory);
    manifest.root_directory = {
        path: path.basename(directory), // 최상위 디렉터리 이름만 저장
        size: size,
        hash: dirHash
    };

    // 각 하위 디렉터리 및 파일에 대한 메타데이터 생성
    const addFilesAndDirectories = (currentDir) => {
        const filesAndDirs = fs.readdirSync(currentDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

        filesAndDirs.forEach(dirent => {
            const fullPath = path.join(currentDir, dirent.name);
            const relativePath = path.relative(directory, fullPath);

            if (dirent.isDirectory()) {
                const { size, dirHash } = calculateDirectorySizeAndHash(fullPath);
                manifest.directories.push({
                    path: relativePath,
                    size: size,
                    hash: dirHash
                });
                addFilesAndDirectories(fullPath); // 하위 디렉터리 재귀 호출
            } else {
                const fileSize = fs.statSync(fullPath).size;
                const fileHash = calculateFileHash(fullPath);
                manifest.files.push({
                    path: relativePath,
                    size: fileSize,
                    hash: fileHash
                });
            }
        });
    };

    addFilesAndDirectories(directory);
    return manifest;
}

// CLI 실행 코드
if (require.main === module) {
    const targetDirectory = process.argv[2] || '.'; // 디폴트: 현재 디렉터리
    const outputFilePath = path.join(process.cwd(), 'manifest.json'); // 스크립트를 실행한 디렉터리에 저장

    console.log(`Generating manifest for directory: ${targetDirectory}`);
    const manifest = generateFileManifest(targetDirectory);

    fs.writeFileSync(outputFilePath, JSON.stringify(manifest, null, 2));
    console.log(`Manifest 파일이 생성되었습니다: ${outputFilePath}`);
}
