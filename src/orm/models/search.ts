export interface Search {
    fieldName: string;
    value: any;
}

export interface TargetRessource {
    id: number;
    label: string;
}

export interface TargetByLink {
    label: string;
    linkLabel: string;
    returnName: string;
}