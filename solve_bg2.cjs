const fs = require('fs');
const PNG = require('pngjs').PNG;

// We want to make white/light pixels transparent in the logo,
// EXCEPT for the text at the bottom.
const THRESHOLD = 230; // Anything brighter than this is considered "white"

fs.createReadStream('public/logo-ddcn-final.png')
    .pipe(new PNG())
    .on('parsed', function() {
        let width = this.width;
        let height = this.height;
        let data = this.data;
        let changed = 0;

        // The text "Thành phố Hồ Chí Minh" is at the bottom. 
        // Let's protect the bottom 25% of the image.
        let protectedY = height * 0.75;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let idx = (width * y + x) << 2;
                let r = data[idx];
                let g = data[idx + 1];
                let b = data[idx + 2];
                let a = data[idx + 3];

                // If pixel is in the protected text area, skip it.
                if (y >= protectedY) continue;

                // Make background and inner holes transparent.
                // We use a broader threshold and adjust alpha based on how white it is to smooth edges.
                if (r > THRESHOLD && g > THRESHOLD && b > THRESHOLD && a > 0) {
                    // Turn it transparent. 
                    // Actually, if it's near the edge of a letter, we could do soft masking.
                    // For now, let's just make it completely transparent.
                    data[idx + 3] = 0;
                    changed++;
                } else if (r > 200 && g > 200 && b > 200 && a > 0) {
                    // Semi-transparent for anti-aliasing edges
                    // The closer to white (255), the more transparent (lower alpha).
                    let brightness = (r + g + b) / 3;
                    let factor = (255 - brightness) / (255 - 200); // 0 at 255, 1 at 200
                    data[idx + 3] = Math.floor(a * factor);
                }
            }
        }

        console.log(`Made ${changed} pixels transparent.`);

        this.pack().pipe(fs.createWriteStream('public/logo-ddcn-transparent.png')).on('finish', () => {
            console.log('Done writing logo-ddcn-transparent.png');
        });
    });
