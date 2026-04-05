import React from 'react';
import { HardHat, FileText, Search, Shield } from 'lucide-react';
import { SectionHeader, labelClass, inputWithIconClass, iconClass } from './FormShared';

interface ProjectFormContractorsProps {
    formData: Record<string, any>;
    updateField: (field: string, value: any) => void;
    aiHighlight: (field: string) => string;
}

export const ProjectFormContractors: React.FC<ProjectFormContractorsProps> = ({
    formData,
    updateField,
    aiHighlight
}) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <SectionHeader icon={HardHat} title="Nhà thầu & Tiêu chuẩn" subtitle="Theo mục I.10-13 Mẫu 05 Phụ lục I" />

            {/* Applicable Standards - full width */}
            <div className="mb-4">
                <label className={labelClass}>
                    Tiêu chuẩn, quy chuẩn áp dụng
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="VD: TCVN 5574:2018, QCVN 03:2022/BXD..."
                        className={inputWithIconClass + aiHighlight('ApplicableStandards')}
                        value={formData.ApplicableStandards}
                        onChange={e => updateField('ApplicableStandards', e.target.value)}
                    />
                    <FileText className={iconClass} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Feasibility Contractor */}
                <div>
                    <label className={labelClass}>NT lập BCNCKT</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tên nhà thầu..."
                            className={inputWithIconClass}
                            value={formData.FeasibilityContractor}
                            onChange={e => updateField('FeasibilityContractor', e.target.value)}
                        />
                        <HardHat className={iconClass} />
                    </div>
                </div>

                {/* Survey Contractor */}
                <div>
                    <label className={labelClass}>NT khảo sát XD</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tên nhà thầu..."
                            className={inputWithIconClass}
                            value={formData.SurveyContractor}
                            onChange={e => updateField('SurveyContractor', e.target.value)}
                        />
                        <Search className={iconClass} />
                    </div>
                </div>

                {/* Review Contractor */}
                <div>
                    <label className={labelClass}>NT thẩm tra</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tên nhà thầu..."
                            className={inputWithIconClass}
                            value={formData.ReviewContractor}
                            onChange={e => updateField('ReviewContractor', e.target.value)}
                        />
                        <Shield className={iconClass} />
                    </div>
                </div>
            </div>
        </div>
    );
};
