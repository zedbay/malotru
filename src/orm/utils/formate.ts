import { Link } from "../models/link";

export function formatOneElement(neo4jResponse) {
    if (neo4jResponse.records.length === 0) {
        return { error: 'no entity with this id' };
    }
    return getRessourceFromRecord(neo4jResponse.records[0]._fields[0]);
}

export function formatMultipleElements(neo4jResponse) {
    if (neo4jResponse.records.lenght === 0) {
        return [];
    }
    const elements = [];
    neo4jResponse.records.forEach(element => {
        elements.push(getRessourceFromRecord(element._fields[0]));
    });
    return elements;
}

export function formatLinkCreation(neo4jResponse): Link {
    if (neo4jResponse.records.lenght < 1) {
        return { error: 'One element not found' };
    }
    return {
        source: getRessourceFromRecord(neo4jResponse.records[0]._fields[0]),
        target: getRessourceFromRecord(neo4jResponse.records[0]._fields[1])
    };
}

function getRessourceFromRecord(record) {
    return {
        id: record.identity.low,
        ...record.properties
    }
}