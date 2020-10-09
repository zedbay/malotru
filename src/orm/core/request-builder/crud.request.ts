import { _main } from "../../constants/malotru.consts"
import { MalotruRessource } from "../../models/ressource";
import { creationOfElementRequest, updateOfelementRequest } from "./buildRequest";

export function list(label: string): string {
    const request = `
        MATCH (${_main}:${label}) RETURN ${_main}
    `;
    return request;
}

export function updateRequest<T extends MalotruRessource>(item: T, label: string): string {
    const request = updateOfelementRequest(label, item);
    return request;
}

export function createRequest<T extends MalotruRessource>(item: T, label: string): string {
    const request = creationOfElementRequest(label, item);
    return request;
}

export function readRequest(itemId: number): string {
    const request = `
        MATCH (${_main}:${this.label}) WHERE ID(${_main})=${itemId} RETURN ${_main}
    `;
    return request;
}

export function deleteRequest(itemId: number): string {
    const request = `
        MATCH 
            (${_main}:${this.label}) 
        WHERE 
            ID(${_main})=${itemId} 
        DETACH DELETE ${_main} RETURN ${_main}`;
    return request;
}