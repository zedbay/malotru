import { Search } from "../models/search";

export function creationOfElementRequest(label: string, item): string {
    let request = `CREATE (u:${label} {`;
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
    request += '}) RETURN u';
    return request;
}

export function searchElementRequest(searchs: Search[], label: string): string {
    let request = `MATCH (u:${label} {`;
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
    request += '}) RETURN u';
    return request;
}

export function updateOfelementRequest(label: string, item): string {
    let request = `MATCH (u:${label}) WHERE ID(u)=${item.id} SET `;
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
    request += ' RETURN u';
    return request;
}
