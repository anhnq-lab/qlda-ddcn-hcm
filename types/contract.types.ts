// Contract & Payment types

// 5.2. Hợp đồng Xây dựng
export enum ContractStatus {
    Executing = 1, // Đang thực hiện
    Paused = 2,    // Tạm dừng
    Liquidated = 3 // Đã thanh lý
}

export interface Contract {
    ContractID: string;
    PackageID: string;
    ContractorID: string;
    ProjectID: string;
    ContractName: string;
    ContractType?: string;
    SignDate: string;
    Value: number;
    AdvanceRate: number;
    Warranty: number;
    Status: ContractStatus;
    HasVAT?: boolean;
    Scope?: string;
    DurationMonths?: number;
    StartDate?: string;
    EndDate?: string;
    PaymentTerms?: string;
    VariationOrders?: VariationOrder[];
}

// 5.3. Thanh toán & Giải ngân
export enum PaymentType {
    Advance = 'Advance',
    Volume = 'Volume'
}

export enum PaymentStatus {
    Draft = 'Draft',
    Pending = 'Pending',
    Approved = 'Approved',
    Transferred = 'Transferred',
    Rejected = 'Rejected'
}

export interface Payment {
    PaymentID: number;
    ContractID: string;
    ProjectID?: string;
    BatchNo: number;
    Type: PaymentType;
    Amount: number;
    TreasuryRef: string;
    Status: PaymentStatus;
    Description?: string;
    RequestDate?: string;
    ApprovedDate?: string;
    PaidDate?: string;
    ApprovedBy?: string;
    RejectedReason?: string;
    RejectedBy?: string;
    RejectedDate?: string;
}

// Module 4: Contracts & Bidding Enhancements
export interface VariationOrder {
    VOID: string;
    ContractID: string;
    Number: string;
    SignDate: string;
    Content: string;
    AdjustedAmount: number;
    AdjustedDuration: number;
    ApprovalFile?: string;
}
