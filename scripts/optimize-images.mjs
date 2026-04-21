import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(process.cwd(), 'public', 'images');
const sourceExtensions = new Set(['.jpg', '.jpeg', '.png', '.heic', '.webp']);
const maxDimension = 1800;
const quality = 82;

const stats = {
  converted: 0,
  optimized: 0,
  skipped: 0,
  failed: 0,
  beforeBytes: 0,
  afterBytes: 0,
};

async function listImages(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listImages(fullPath);
      }

      const extension = path.extname(entry.name).toLowerCase();
      return sourceExtensions.has(extension) ? [fullPath] : [];
    })
  );

  return files.flat();
}

async function fileSize(filePath) {
  const file = await fs.stat(filePath);
  return file.size;
}

async function optimizeImage(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const isWebp = extension === '.webp';
  const outputPath = isWebp
    ? `${filePath}.tmp`
    : path.join(
        path.dirname(filePath),
        `${path.basename(filePath, path.extname(filePath))}.webp`
      );

  const beforeBytes = await fileSize(filePath);

  if (!isWebp) {
    try {
      await fs.access(outputPath);
      stats.skipped += 1;
      return;
    } catch {
      // No existing WebP sibling, so this source image can be converted.
    }
  }

  await sharp(filePath, { failOn: 'none' })
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 5,
    })
    .toFile(outputPath);

  const afterBytes = await fileSize(outputPath);

  if (isWebp) {
    if (afterBytes < beforeBytes) {
      await fs.rename(outputPath, filePath);
      stats.optimized += 1;
      stats.beforeBytes += beforeBytes;
      stats.afterBytes += afterBytes;
      return;
    }

    await fs.unlink(outputPath);
    stats.skipped += 1;
    return;
  }

  stats.converted += 1;
  stats.beforeBytes += beforeBytes;
  stats.afterBytes += afterBytes;
}

const images = await listImages(root);

for (const image of images) {
  try {
    await optimizeImage(image);
  } catch (error) {
    stats.failed += 1;
    console.warn(`Failed: ${path.relative(process.cwd(), image)}`);
    console.warn(error instanceof Error ? error.message : error);
  }
}

const savedBytes = stats.beforeBytes - stats.afterBytes;
const savedMb = (savedBytes / 1024 / 1024).toFixed(2);

console.log(
  JSON.stringify(
    {
      ...stats,
      savedMb,
    },
    null,
    2
  )
);
