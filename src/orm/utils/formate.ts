import { QueryResult, Record } from "neo4j-driver";
import { Link } from "../models/link";
import { MalotruResponse } from "../models/malotruresponse";
import { MalotruRessource } from "../models/ressource";

export function formateToMalotruResponse<T extends MalotruRessource>(response: QueryResult): MalotruResponse<T> {
    const records: Record[] = response.records;
    return {
        ressources: records.map((record: Record) => {
            return getRessourceFromRecord<T>(record, record.keys[0])
        })
    };
}

export function formatLinkCreation(response: QueryResult): Link {
    const record: Record = response.records[0];
    return {
        source: getRessourceFromRecord(record, record.keys[0]),
        target: getRessourceFromRecord(record, record.keys[1])
    };
}

function getRessourceFromRecord<T extends MalotruRessource>(record: Record, key: string): T {
    const recordObject: Object = record.toObject();
    return {
        id: recordObject[key].identity.low,
        ...recordObject[key].properties
    } as T;
}


