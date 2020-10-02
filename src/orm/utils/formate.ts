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

export function unknowFormat(response: QueryResult) {
    const mainRecord: Record = response.records[0];
    const keys: string[] = mainRecord.keys;
    const recordObject: Object = mainRecord.toObject();
    let returnObject = {
        id: recordObject['s'].identity,
        ...recordObject['s'].properties
    }
    keys.forEach((key: string) => {
        if (key === 's') {
            return;
        }
        returnObject = {
            ...returnObject,
            [key]: []
        }
    });
    response.records.forEach((record: Record) => {
        const object: Object = record.toObject();
        keys.forEach((key: string) => {
            if (key === 's') {
                return;
            }
            returnObject[key].push({
                id: object[key].identity,
                ...recordObject[key].properties
            });
        });
    });


    console.log(returnObject);


    // console.log(record);
    // response.records.forEach((ee) => {
    //     console.log(ee);
    //     console.log(getRessourceFromRecord(ee,))
    // })
}

export function formatLinkCreation(response: QueryResult): Link {
    const record: Record = response.records[0];
    if (!record) { return undefined };
    return {
        source: getRessourceFromRecord(record, record.keys[0]),
        target: getRessourceFromRecord(record, record.keys[1])
    };
}

function getRessourceFromRecord<T extends MalotruRessource>(record: Record, key: string): T {
    const recordObject: Object = record.toObject();
    return {
        id: recordObject[key].identity,
        ...recordObject[key].properties
    } as T;
}


