export const parseSla = (sla: string): number => {
    return parseInt(sla) || 0;
};

export const uploadTemplateFile = async (file: File): Promise<string> => {
    return "uploaded_url";
};

export const appendTemplateName = (name: string): string => {
    return name + " Template";
};

export const resolveLegalReference = (ref: string): any => {
    return null;
};
