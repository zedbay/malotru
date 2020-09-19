import { MalotruRessource } from "./ressource";

export interface Link {
    source: MalotruRessource;
    target: MalotruRessource;
}

export interface TargetLink {
    id: number;
    label: string;
}

export enum OrientationLink {
    ToTarget,
    ToSource,
    Neutre
}