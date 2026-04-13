const fs = require('fs');

try {
    const file = 'resources/Quy che Ban/quyche_extracted.md';
    let text = fs.readFileSync(file, 'utf8');

    // Mảng các lỗi phổ biến (chữ bị tách làm 2 bởi bộ chuyển đổi PDF sang word)
    const map = {
        "ch ế": "chế", "k ế": "kế", "t ắc": "tắc", "nhi ệm": "nhiệm", "h ệ": "hệ", 
        "ph ạm": "phạm", "gi ải": "giải", "gi  ải": "giải", "vi ệc": "việc", 
        "qu ản": "quản", "d ự": "dự", "d ụng": "dụng", "nghi ệp": "nghiệp", 
        "t ắt": "tắt", "đ ịnh": "định", "đ ầu": "đầu", "đ ộng": "động", 
        "s ự": "sự", "l ên": "lên", "c ấp": "cấp", "đ ạo": "đạo", "b ản": "bản", 
        "t ư": "tư", "b ảo": "bảo", "t ức": "tức", "ch ức": "chức", "đ ảm": "đảm", 
        "ph ối": "phối", "h ợp": "hợp", "quy ết": "quyết", "c ủa": "của", 
        "s ửa": "sửa", "b ổ": "bổ", "m ột": "một", "s ố": "số", "đ iều": "điều", 
        "t rình": "trình", "t oán": "toán", "t hiết": "thiết", "k hảo": "khảo",
        "m ối": "mối", "quan h ệ": "quan hệ", "c ông": "công", "t ác": "tác",
        "nguy ên": "nguyên", "gi ải quy ết": "giải quyết", "k iểm": "kiểm", "t ra": "tra"
    };

    // Replace all mappings globally
    for (const [bad, good] of Object.entries(map)) {
        // use global string replace
        text = text.split(bad).join(good);
    }
    
    // Auto-join remaining pattern: consonant + space + specific tone vowel using Regex, 
    // BUT only if it occurs inside a common known prefix/suffix combo to avoid destroying real words!
    // Since Vietnamese is complex, let's stick to the map to be 100% safe.
    // However, since it is scattered heavily, we can use a safe regex for common split vowels:
    // Pattern: ([a-zđ]) space+ ([áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]\w*)
    // Safe because we limit it to occurrences NOT standalone in language like "ủy", "ý", "ở", "âm"
    const safeRegex = /([bcdđghklmnpqrstvx])\s+([áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ]\w*)/gi;
    let occurrences = 0;
    text = text.replace(safeRegex, (match, p1, p2) => {
        // false positive protection for known valid words
        const badWords = ["ủy", "ý", "ở", "âm", "ấm", "ẩm", "ảo", "áp", "ẩn", "ấp", "ấy", "ẩu", "âu", "áo", "á"];
        if (badWords.includes(p2.toLowerCase())) return match;
        
        occurrences++;
        return p1 + p2;
    });
    
    console.log("Fixed via regex: " + occurrences + " entries");

    fs.writeFileSync(file, text, 'utf8');
    console.log("Cleaned spaces in file:", file);
} catch (e) {
    console.error(e);
}
