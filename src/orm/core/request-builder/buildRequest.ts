import { _main } from "../../constants/malotru.consts";
import { OrientationLink } from "../../models/link";
import { Search } from "../../models/search";

export function creationOfElementRequest(label: string, item): string {
    let request = `CREATE (${_main}:${label} {`;
    const keys = Object.keys(item);
    keys.forEach((key: string) => {
        switch (typeof item[key]) {
            case 'string':
                request += ` ${key}: '${item[key]}' ,`;
                break;
            case 'boolean':
                request += ` ${key}: ${item[key]} ,`;
                break;
            case 'number':
                request += ` ${key}: ${item[key]} ,`;
                break;
            default:
                break;
        }
    });
    request = request.slice(0, -1);
    request += `}) RETURN ${_main}`;
    return request;
}

export function buildOrientedLink(linkLabel: string, orientation: OrientationLink, returnName = ''): string {
    let requestElement = `${orientation === OrientationLink.ToSource ? '<' : ''}-`;
    requestElement += `[${returnName}:${linkLabel}]`;
    requestElement += `-${orientation === OrientationLink.ToTarget ? '>' : ''}`;
    return requestElement;
}

export function searchElementRequest(searchs: Search[], label: string): string {
    let request = `MATCH (${_main}:${label} {`;
    searchs.forEach((search: Search) => {
        switch (typeof search.value) {
            case 'string':
                request += ` ${search.fieldName}: '${search.value}' ,`;
                break;
            case 'boolean':
                request += ` ${search.fieldName}: ${search.value} ,`;
                break;
            case 'number':
                request += ` ${search.fieldName}: ${search.value} ,`;
                break;
            default:
                break;
        }
    });
    request = request.slice(0, -1);
    request += `}) RETURN ${_main}`;
    return request;
}

export function updateOfelementRequest(label: string, item): string {
    let request = `MATCH (${_main}:${label}) WHERE ID(${_main})=${item.id} SET `;
    const keys = Object.keys(item);
    keys.forEach((key: string) => {
        if (key === 'id') { return; }
        switch (typeof item[key]) {
            case 'string':
                request += ` u.${key} = '${item[key]}' ,`;
                break;
            case 'boolean':
                request += ` u.${key} = ${item[key]} ,`;
                break;
            case 'number':
                request += ` u.${key} = ${item[key]} ,`;
                break;
            default:
                break;
        }
    });
    request = request.slice(0, -1);
    request += ` RETURN ${_main}`;
    return request;
}
