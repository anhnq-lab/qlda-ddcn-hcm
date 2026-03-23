-- Migration: Add construction specification columns to projects table
-- 9 trường kỹ thuật công trình

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS total_estimate numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS site_area numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS construction_area numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS floor_area numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS building_height numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS building_density numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS land_use_coefficient numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS above_ground_floors integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS basement_floors integer DEFAULT 0;

COMMENT ON COLUMN projects.total_estimate IS 'Tổng dự toán (VNĐ)';
COMMENT ON COLUMN projects.site_area IS 'Diện tích khu đất (m²)';
COMMENT ON COLUMN projects.construction_area IS 'Diện tích xây dựng (m²)';
COMMENT ON COLUMN projects.floor_area IS 'Diện tích sàn sử dụng (m²)';
COMMENT ON COLUMN projects.building_height IS 'Chiều cao công trình (m)';
COMMENT ON COLUMN projects.building_density IS 'Mật độ xây dựng (%)';
COMMENT ON COLUMN projects.land_use_coefficient IS 'Hệ số sử dụng đất';
COMMENT ON COLUMN projects.above_ground_floors IS 'Số tầng nổi';
COMMENT ON COLUMN projects.basement_floors IS 'Số tầng hầm';
