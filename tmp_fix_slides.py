import re

file_path = 'd:/QuocAnh/2026/01.Project/qlda-ddcn-hcm/presentation_cic_qlda.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Delete Slide 2 (lines 168-190 approx)
# We will use Regex to find the <!-- Slide 2: Context --> section and remove it
content = re.sub(r'\s*<!-- Slide 2: Context -->\s*<section data-transition="fade">.*?</section>', '', content, flags=re.DOTALL)

# 2. Delete Slide 4 and 5
content = re.sub(r'\s*<!-- Slide 4: AI -->\s*<section data-transition="convex">.*?</section>', '', content, flags=re.DOTALL)
content = re.sub(r'\s*<!-- Slide 5: Planning & BIM -->\s*<section data-transition="slide">.*?</section>', '', content, flags=re.DOTALL)

# 3. Replace Slide 3 (Architecture)
old_slide_3_pattern = r'<!-- Slide 3: Architecture -->\s*<section data-transition="slide">.*?<h2>Cấu trúc Giải pháp \(12 Phân hệ cốt lõi\).*?</section>'
new_slide_2 = r'''<!-- Slide 2: Architecture -->
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
            </section>'''
content = re.sub(old_slide_3_pattern, new_slide_2, content, flags=re.DOTALL)

# 4. Add "Chi phí xây dựng phần mềm" right before Slide 6 (Hạ tầng Cloud & Bảo mật)
new_cost_slide = r'''
            <!-- Slide 3: Chi phí phần mềm -->
            <section data-transition="slide">
                <h2>Phần I — Chi phí Xây dựng Phần mềm</h2>
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
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 18px;">300.000.000</td>
                            </tr>
                            <tr style="background: rgba(0,0,0,0.02);">
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">2</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Xây dựng & phát triển phần mềm</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 18px;">1.200.000.000</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">3</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Kiểm thử & đảm bảo chất lượng (QA/QC)</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 18px;">200.000.000</td>
                            </tr>
                            <tr style="background: rgba(0,0,0,0.02);">
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">4</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Triển khai, cài đặt & đào tạo người dùng</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 18px;">200.000.000</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: center;">5</td>
                                <td style="padding: 12px; border: 1px solid #ccc;">Tài liệu hướng dẫn & chuyển giao</td>
                                <td style="padding: 12px; border: 1px solid #ccc; text-align: right; font-family: monospace; font-size: 18px;">100.000.000</td>
                            </tr>
                            <tr style="background: rgba(211, 84, 0, 0.05); font-weight: bold; color: var(--primary);">
                                <td style="padding: 12px; border: 1px solid #ccc; border-top: 2px solid var(--primary); text-align: center;"></td>
                                <td style="padding: 12px; border: 1px solid #ccc; border-top: 2px solid var(--primary); text-transform: uppercase;">Cộng Phần I</td>
                                <td style="padding: 12px; border: 1px solid #ccc; border-top: 2px solid var(--primary); text-align: right; font-family: monospace; font-size: 22px;">2.000.000.000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
'''

content = content.replace('<!-- Slide 6: Security & Cloud -->', new_cost_slide + '\n            <!-- Slide 4: Security & Cloud -->')
content = content.replace('<!-- Slide 7: ROI -->', '<!-- Slide 5: Vận hành & TCO -->')
content = content.replace('Tổng chi phí sở hữu (TCO)', 'Phần III — Chi phí Vận hành & TCO')
content = content.replace('<h2>Hạ tầng Cloud & Bảo mật</h2>', '<h2>Phần II — Hạ tầng Cloud & Bảo mật</h2>')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Changes applied successfully!")
