import { Search } from "../models/search";

export function creationOfElementRequest(label: string, item): string {
    let request = `CREATE (u:${label} {`;
    const keys = Object.keys(item);
    keys.forEach((key: string) => {
        if (typeof item[key] === "string") {
            request += buildStringElement(key, item[key]);
        }
        if (typeof item[key] === "number") {
            request += buildNumberElement(key, item[key]);
        }
        if (typeof item[key] === "boolean") {
            request += buildBooleanElement(key, item[key]);
        }
    });
    request = request.slice(0, -1);
    request += '}) RETURN u';
    return request;
}

export function searchElementRequest(searchs: Search[], label: string): string {
    let request = `MATCH (u:${label} {`;
    searchs.forEach((search: Search) => {
        if (typeof search.value === "string") {
            request += buildStringSearchElement(search.fieldName, search.value);
        }
        if (typeof search.value === "boolean") {
            request += buildBooleanSearchElement(search.fieldName, search.value);
        }
    })
    request = request.slice(0, -1);
    request += '}) RETURN u';
    return request;
}

export function updateOfelementRequest(label: string, item): string {
    let request = `MATCH (u:${label}) WHERE ID(u)=${item.id} SET `;
    const keys = Object.keys(item);
    keys.forEach((key: string) => {
        if (key === 'id') { return; }
        if (typeof item[key] === "string") {
            request += buildStringUpdateElement(key, item[key]);
        }
        if (typeof item[key] === "boolean") {
            request += buildBooleanUpdateElement(key, item[key]);
        }
    });
    request = request.slice(0, -1);
    request += ' RETURN u';
    return request;
}

function buildStringSearchElement(key: string, value: string): string {
    return ` ${key}: '${value}' ,`;
}

function buildBooleanSearchElement(key: string, value: boolean): string {
    return ` ${key}: ${value} ,`;
}

function buildStringUpdateElement(key: string, value: string): string {
    return ` u.${key} = '${value}' ,`;
}

function buildBooleanUpdateElement(key: string, value: boolean): string {
    return ` u.${key} = ${value} ,`;
}

function buildBooleanElement(key: string, value: boolean): string {
    return ` ${key}: ${value} ,`;
}

function buildNumberElement(key: string, value: number): string {
    return ` ${key}: ${value} ,`;
}

function buildStringElement(key: string, value: string): string {
    return ` ${key}: '${value}' ,`;
}