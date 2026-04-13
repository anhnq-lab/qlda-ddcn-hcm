const fs = require('fs');
const PNG = require('pngjs').PNG;

function isWhite(idx, data) {
    return data[idx] > 240 && data[idx + 1] > 240 && data[idx + 2] > 240 && data[idx + 3] > 0;
}

fs.createReadStream('public/logo-ddcn-final.png')
    .pipe(new PNG())
    .on('parsed', function() {
        // Find all white regions
        let width = this.width;
        let height = this.height;
        let data = this.data;
        let visited = new Uint8Array(width * height);
        
        let regions = [];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let pIdx = (y * width + x);
                let idx = pIdx << 2;
                
                if (!visited[pIdx] && isWhite(idx, data)) {
                    // Start flood fill
                    let region = {
                        pixels: [],
                        minY: y,
                        maxY: y,
                        hasOrigin: false
                    };
                    
                    let queue = [pIdx];
                    visited[pIdx] = 1;
                    
                    let head = 0;
                    while(head < queue.length) {
                        let curr = queue[head++];
                        region.pixels.push(curr);
                        
                        let cy = Math.floor(curr / width);
                        let cx = curr % width;
                        
                        if (cx === 0 && cy === 0) region.hasOrigin = true;
                        
                        if (cy < region.minY) region.minY = cy;
                        if (cy > region.maxY) region.maxY = cy;
                        
                        // neighbors
                        let neighbors = [
                            [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
                        ];
                        
                        for (let n of neighbors) {
                            if (n[0] >= 0 && n[0] < width && n[1] >= 0 && n[1] < height) {
                                let nPidx = n[1] * width + n[0];
                                if (!visited[nPidx] && isWhite(nPidx << 2, data)) {
                                    visited[nPidx] = 1;
                                    queue.push(nPidx);
                                }
                            }
                        }
                    }
                    
                    regions.push(region);
                }
            }
        }
        
        console.log(`Found ${regions.length} white regions!`);
        
        // Now determine which regions to make transparent
        let changed = 0;
        for (let r of regions) {
            let makeTransparent = false;
            if (r.hasOrigin || r.pixels.length > width*height*0.1) {
                // Background
                makeTransparent = true;
            } else if (r.maxY < height * 0.70) {
                // Upper half white island (D holes)
                makeTransparent = true;
            }
            // else: text at the bottom, keep it white
            
            if (makeTransparent) {
                for (let pIdx of r.pixels) {
                    let idx = pIdx << 2;
                    data[idx + 3] = 0; // alpha = 0
                    changed++;
                }
            }
        }
        
        console.log(`Made ${changed} pixels transparent.`);
        
        this.pack().pipe(fs.createWriteStream('public/logo-ddcn-transparent.png')).on('finish', () => {
            console.log('Done writing logo-ddcn-transparent.png');
        });
    });
