import React from 'react';
import { FileText, Gavel, Users, Shield, Briefcase, Building, FileCheck } from 'lucide-react';

export interface Article {
    id: string;
    title: string;
    content: (string | React.ReactNode)[];
}

export interface Chapter {
    id: string;
    title: string;
    icon?: React.ElementType;
    articles: Article[];
}

export const regulationsData: Chapter[] = [
    {
        id: "chuong-i",
        title: "Quy định chung",
        icon: Gavel,
        articles: [
            {
                id: "dieu-1",
                title: "Phạm vi điều chỉnh",
                content: [
                    "Quy chế này quy định về tổ chức và hoạt động của Ban Quản lý dự án.",
                    "Áp dụng cho toàn bộ cán bộ, viên chức và người lao động của Ban."
                ]
            },
            {
                id: "dieu-2",
                title: "Đối tượng áp dụng",
                content: [
                    "Cán bộ, viên chức.",
                    "Người lao động làm việc theo chế độ hợp đồng."
                ]
            }
        ]
    },
    {
        id: "chuong-ii",
        title: "Cơ cấu tổ chức",
        icon: Users,
        articles: [
            {
                id: "dieu-3",
                title: "Cơ cấu các Phòng/Ban",
                content: [
                    "Ban Giám đốc.",
                    "Phòng Kế hoạch - Tài chính.",
                    "Phòng Kỹ thuật - Thẩm định.",
                    "Phòng Quản lý thi công."
                ]
            }
        ]
    },
    {
        id: "chuong-iii",
        title: "Quy định làm việc",
        icon: Briefcase,
        articles: [
            {
                id: "dieu-4",
                title: "Thời gian làm việc",
                content: [
                    "Sáng: 08:00 - 12:00",
                    "Chiều: 13:00 - 17:00"
                ]
            }
        ]
    }
];
