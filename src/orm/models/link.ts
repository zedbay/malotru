import { MalotruRessource } from "./ressource";

export interface Link {
    source: MalotruRessource;
    target: MalotruRessource;
}

export enum OrientationLink {
    ToTarget,
    ToSource,
    Neutre
}