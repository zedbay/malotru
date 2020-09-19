import { MalotruRessource } from "./ressource";

export interface MalotruResponse<T extends MalotruRessource> {
    ressources: T[];
}