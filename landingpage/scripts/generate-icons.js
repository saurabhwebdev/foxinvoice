import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const SIZES = {
  favicon: [16, 32, 48],
  apple: [57, 60, 72, 76, 114, 120, 144, 152, 180],
  android: [36, 48, 72, 96, 144, 192, 512],
  ms: [70, 150, 310]
};

async function generateIcons() {
  // Create dist directory if it doesn't exist
  const distPath = path.join(process.cwd(), 'public', 'icons');
  await fs.mkdir(distPath, { recursive: true });

  // Read the source SVG
  const sourceBuffer = await fs.readFile(path.join(process.cwd(), 'public', 'logo.svg'));

  // Generate favicons
  for (const size of SIZES.favicon) {
    await sharp(sourceBuffer)
      .resize(size, size)
      .toFile(path.join(distPath, `favicon-${size}x${size}.png`));
  }

  // Generate Apple touch icons
  for (const size of SIZES.apple) {
    await sharp(sourceBuffer)
      .resize(size, size)
      .toFile(path.join(distPath, `apple-touch-icon-${size}x${size}.png`));
  }

  // Generate Android icons
  for (const size of SIZES.android) {
    await sharp(sourceBuffer)
      .resize(size, size)
      .toFile(path.join(distPath, `android-chrome-${size}x${size}.png`));
  }

  // Generate Microsoft tiles
  for (const size of SIZES.ms) {
    await sharp(sourceBuffer)
      .resize(size, size)
      .toFile(path.join(distPath, `mstile-${size}x${size}.png`));
  }

  // Generate favicon.ico (multi-size)
  await sharp(sourceBuffer)
    .resize(32, 32)
    .toFile(path.join(distPath, 'favicon.ico'));

  // Generate manifest.json
  const manifest = {
    name: 'Paytrail',
    short_name: 'Paytrail',
    description: 'Professional Invoicing Made Simple',
    start_url: '/',
    display: 'standalone',
    background_color: '#EDF2F4',
    theme_color: '#EF233C',
    icons: SIZES.android.map(size => ({
      src: `/icons/android-chrome-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: 'any maskable'
    }))
  };

  await fs.writeFile(
    path.join(distPath, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Generate browserconfig.xml
  const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/icons/mstile-70x70.png"/>
      <square150x150logo src="/icons/mstile-150x150.png"/>
      <wide310x150logo src="/icons/mstile-310x150.png"/>
      <TileColor>#EF233C</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

  await fs.writeFile(
    path.join(distPath, 'browserconfig.xml'),
    browserconfig
  );
}

generateIcons().catch(console.error); 