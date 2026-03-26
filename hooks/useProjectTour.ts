import { useCallback } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { ProjectPhase } from '../components/onboarding/ProjectLifecycleTracker';

const TOUR_STEPS: Record<ProjectPhase, DriveStep[]> = {
  initiation: [
    {
      element: '#tab-info',
      popover: {
        title: 'Giai đoạn: Chuẩn bị đầu tư',
        description: 'Tại tab Tổng quan này, bạn có thể Tóm tắt dự án bằng AI hoặc Chỉnh sửa thông tin nhanh.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#btn-edit-project',
      popover: {
        title: 'Chỉnh sửa dự án',
        description: 'Cập nhật Tên dự án, Quyết định phê duyệt hoặc Tổng mức đầu tư tại đây.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#btn-ai-summary',
      popover: {
        title: 'Trợ lý AI',
        description: 'Bấm vào đây để AI phân tích và tóm tắt nhanh tình trạng dự án cho bạn.',
        side: 'left',
        align: 'start',
      },
    },
  ],
  planning: [
    {
      element: '#tab-bidding',
      popover: {
        title: 'Kế hoạch lựa chọn nhà thầu',
        description: 'Truy cập tab Đấu thầu để bắt đầu lên danh mục các gói thầu.',
        side: 'bottom',
        align: 'start',
      },
    },
  ],
  execution: [
    {
      element: '#tab-contracts',
      popover: {
        title: 'Quản lý Hợp đồng',
        description: 'Bạn có thể chuyển đổi Gói thầu thành Hợp đồng hoặc Tạo mới hợp đồng tại đây.',
        side: 'bottom',
        align: 'start',
      },
    },
  ],
  closure: [
    {
      element: '#tab-tt24',
      popover: {
        title: 'Bàn giao và Quyết toán',
        description: 'Truy cập tab Đồng bộ CSDL để kiểm tra tuân thủ các mốc báo cáo kết thúc.',
        side: 'bottom',
        align: 'start',
      },
    },
  ],
};

export const useProjectTour = () => {
  const startTour = useCallback((phase: ProjectPhase) => {
    const steps = TOUR_STEPS[phase];
    if (!steps || steps.length === 0) {
      console.warn('Chưa có kịch bản hướng dẫn cho giai đoạn này.');
      return;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: 'Tiếp theo',
      prevBtnText: 'Quay lại',
      doneBtnText: 'Hoàn tất',
      progressText: 'Bước {{current}} / {{total}}',
      steps: steps,
      popoverClass: 'driverjs-theme-qlda',
    });

    driverObj.drive();
  }, []);

  return { startTour };
};
