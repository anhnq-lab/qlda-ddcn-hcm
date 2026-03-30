const fs = require('fs');

const filePath = 'd:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/presentation_cic_qlda.html';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Delete Slide 2
content = content.replace(/\s*<!-- Slide 2: Context -->[\s\S]*?<!-- Slide 3: Architecture -->/m, '\n\n            <!-- Slide 3: Architecture -->');

// 2. Replace Slide 3 (Architecture)
const oldSlide3Pattern = /<!-- Slide 3: Architecture -->\s*<section data-transition="slide">[\s\S]*?<h2>Cấu trúc Giải pháp \(12 Phân hệ cốt lõi\)<\/h2>[\s\S]*?<\/section>/m;

const newSlide2 = `<!-- Slide 2: Architecture -->
            <section data-transition="slide">
                <h2>Cấu trúc Giải pháp (12 Phân hệ cốt lõi)</h2>
                <div class="grid-4" style="margin-top: 20px;">
                    <!-- Card 1 -->
                    <div class="glass-card" style="padding: 20px;">
                        <div style="font-size: 28px; margin-bottom: 5px; text-align: center;">📊</div>
                        <h4 style="color: var(--primary); font-size: 18px; margin-bottom: 15px; text-align: center;">Điều hành</h4>
                        <ul style="font-size: 16px; padding-left: 15px; text-align: left; color: var(--text-main); line-height: 1.8;">
                            <li>Dashboard Chỉ huy</li>
                            <li>Quản lý Dự án (WBS)</li>
                            <li>Quy trình & Pháp lý</li>
                        </ul>
                    </div>

                    <!-- Card 2 -->
                    <div class="glass-card" style="padding: 20px;">
                        <div style="font-size: 28px; margin-bottom: 5px; text-align: center;">💰</div>
                        <h4 style="color: var(--secondary); font-size: 18px; margin-bottom: 15px; text-align: center;">Tài chính</h4>
                        <ul style="font-size: 16px; padding-left: 15px; text-align: left; color: var(--text-main); line-height: 1.8;">
                            <li>Phân hệ Đấu thầu</li>
                            <li>Quản lý Hợp đồng</li>
                            <li>Vốn & Giải ngân</li>
                        </ul>
                    </div>

                    <!-- Card 3 -->
                    <div class="glass-card" style="padding: 20px;">
                        <div style="font-size: 28px; margin-bottom: 5px; text-align: center;">🏗️</div>
                        <h4 style="color: var(--accent); font-size: 18px; margin-bottom: 15px; text-align: center;">Dữ liệu (CDE)</h4>
                        <ul style="font-size: 16px; padding-left: 15px; text-align: left; color: var(--text-main); line-height: 1.8;">
                            <li>Kho lưu trữ CDE</li>
                            <li>BIM Viewer (Web)</li>
                            <li>QL Chất lượng</li>
                        </ul>
                    </div>

                    <!-- Card 4 -->
                    <div class="glass-card" style="padding: 20px;">
                        <div style="font-size: 28px; margin-bottom: 5px; text-align: center;">⚙️</div>
                        <h4 style="color: var(--accent2); font-size: 18px; margin-bottom: 15px; text-align: center;">Hỗ trợ</h4>
                        <ul style="font-size: 16px; padding-left: 15px; text-align: left; color: var(--text-main); line-height: 1.8;">
                            <li>Quản lý Nhân sự</li>
                            <li>Cổng Nhà thầu</li>
                            <li>Báo cáo tự động</li>
                        </ul>
                    </div>
                </div>
            </section>`;
content = content.replace(oldSlide3Pattern, newSlide2);

// 3. Delete Slide 4 and 5
content = content.replace(/\s*<!-- Slide 4: AI -->[\s\S]*?<!-- Slide 6: Security & Cloud -->/m, '\n\n            <!-- Slide 6: Security & Cloud -->');

// 4. Add "Chi phí xây dựng phần mềm" right before Slide 6
const newCostSlide = `<!-- Slide 3: Chi phí phần mềm -->
            <section data-transition="slide">
                <h2 style="margin-bottom: 30px;">Phần I — Chi phí Xây dựng Phần mềm</h2>
                <div class="glass-card" style="padding: 5px 20px; font-size: 16px;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background: var(--bg-dark); color: white;">
                                <th style="padding: 12px; border: 1px solid #ccc; text-align: center; width: 8%;">STT</th>
                                <th style="padding: 12px; border: 1px solid #ccc; text-align: center;">Hạng mục</th>
                                <th style="padding: 12px; border: 1px solid #ccc; text-align: center; width: 30%;">Thành tiền (VNĐ)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">1</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Phân tích nghiệp vụ & thiết kế hệ thống</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 19px;">300.000.000</td>
                            </tr>
                            <tr style="background: rgba(0,0,0,0.02);">
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">2</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Xây dựng & phát triển phần mềm</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 19px;">1.200.000.000</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">3</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Kiểm thử & đảm bảo chất lượng (QA/QC)</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 19px;">200.000.000</td>
                            </tr>
                            <tr style="background: rgba(0,0,0,0.02);">
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">4</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Triển khai, cài đặt & đào tạo người dùng</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 19px;">200.000.000</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">5</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Tài liệu hướng dẫn & chuyển giao</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 19px;">100.000.000</td>
                            </tr>
                            <tr style="background: rgba(211, 84, 0, 0.05); font-weight: bold;">
                                <td style="padding: 12px; border: 1px solid #ccc; border-top: 2px solid var(--primary); text-align: center;"></td>
                                <td style="padding: 12px; border: 1px solid #ccc; border-top: 2px solid var(--primary); text-transform: uppercase;">Cộng Phần I</td>
                                <td style="padding: 12px; border: 1px solid #ccc; border-top: 2px solid var(--primary); text-align: right; font-family: monospace; font-size: 24px; color: var(--primary);">2.000.000.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Slide 4: Security & Cloud -->`;

content = content.replace('<!-- Slide 6: Security & Cloud -->', newCostSlide);
content = content.replace('<!-- Slide 7: ROI -->', '<!-- Slide 5: Vận hành & TCO -->');
content = content.replace('<h2>Hạ tầng Cloud & Bảo mật</h2>', '<h2>Phần II — Hạ tầng Cloud & Bảo mật</h2>');

// Find and replace ROI headings
content = content.replace(/Tổng mức đầu tư & Hiệu quả ROI/g, 'Phần III — Tổng mức đầu tư & Chi phí Vận hành (ROI)');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Changes applied successfully!");
