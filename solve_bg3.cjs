const fs = require('fs');
const PNG = require('pngjs').PNG;

function isWhite(idx, data, threshold = 220) {
    return data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold && data[idx + 3] > 0;
}

fs.createReadStream('public/logo-ddcn-final.png')
    .pipe(new PNG())
    .on('parsed', function() {
        let width = this.width;
        let height = this.height;
        let data = this.data;
        let visited = new Uint8Array(width * height);
        
        let changed = 0;
        let protectedY = height * 0.80; // Text is at the very bottom, let's say bottom 20%
        
        // 1. Flood fill from (0,0) to clear the main outer background
        let queue = [0]; // pixel index 0
        visited[0] = 1;
        
        let head = 0;
        while(head < queue.length) {
            let curr = queue[head++];
            
            // Make background pixel transparent
            let idx = curr << 2;
            data[idx + 3] = 0; 
            changed++;
            
            let cy = Math.floor(curr / width);
            let cx = curr % width;
            
            let neighbors = [
                [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1],
                [cx + 1, cy + 1], [cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1]
            ];
            
            for (let n of neighbors) {
                if (n[0] >= 0 && n[0] < width && n[1] >= 0 && n[1] < height) {
                    let nPidx = n[1] * width + n[0];
                    if (!visited[nPidx] && isWhite(nPidx << 2, data, 220)) { // looser threshold for background
                        visited[nPidx] = 1;
                        queue.push(nPidx);
                    }
                }
            }
        }
        
        // 2. Clear out any inner white holes in the upper part of the image
        // D, D, C, n are all above 80% height.
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pIdx = (y * width + x);
                if (visited[pIdx]) continue; // Already processed as background
                
                let idx = pIdx << 2;
                
                if (y < protectedY && isWhite(idx, data, 200)) {
                    // It's a white-ish pixel inside an enclosed area in the top 80%.
                    // Let's make it transparent. Use alpha blending for edge smoothness.
                    let brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                    if (brightness >= 240) {
                        data[idx + 3] = 0;
                    } else {
                        // Anti-alias
                        let a = data[idx+3];
                        let factor = (255 - brightness) / (255 - 200); // 0 at 255, 1 at 200
                        data[idx + 3] = Math.floor(a * factor);
                    }
                    changed++;
                }
            }
        }
        
        console.log(`Made ${changed} pixels transparent.`);
        
        this.pack().pipe(fs.createWriteStream('public/logo-ddcn-transparent.png')).on('finish', () => {
            console.log('Done writing logo-ddcn-transparent.png');
        });
    });
