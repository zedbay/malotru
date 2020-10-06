import { QueryResult, Record } from "neo4j-driver";
import { _ignored, _main, _target } from "../constants/malotru.consts";
import { Link } from "../models/link";
import { MalotruRessource } from "../models/ressource";


export function formatRecords<T extends MalotruRessource>(response: QueryResult): T[] {
    return response.records.map((record: Record) => formatOneRecord(record));
}

export function formatLink(response: QueryResult): Link {
    const record: Record = response.records[0];
    if (!record) { return undefined };
    const recordObject: Object = record.toObject();
    return {
        source: transformElementIntoMalotruRessource(recordObject[_main]),
        target: transformElementIntoMalotruRessource(recordObject[_target])
    };
}

function formatOneRecord(record: Record) {
    const keys: string[] = record.keys;
    const recordObject: Object = record.toObject();
    let returnObject = transformElementIntoMalotruRessource(recordObject[_main]);
    keys.forEach((key: string) => {
        if (key === _main) {
            return;
        }
        returnObject = {
            ...returnObject,
            [key]: recordObject[key].map((element) => transformElementIntoMalotruRessource(element))
        };
    });
    return returnObject;
}

function transformElementIntoMalotruRessource(element) {
    return {
        id: element.identity,
        ...element.properties
    }
}

