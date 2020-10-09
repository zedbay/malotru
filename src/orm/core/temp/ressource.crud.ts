import { Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { MalotruRessource } from "../../models/ressource";
import { creationOfElementRequest, updateOfelementRequest } from "../request-builder/buildRequest";
import { formatRecords } from "../../utils/formate";
import { Malotru } from "../../malotru";
import { QueryResult } from "neo4j-driver";
import { _main } from "../../constants/malotru.consts";


export interface CrudI<T extends MalotruRessource> {
    list: () => Observable<T[]>;
    update: (item: T) => Observable<T>;
    create: (item: T) => Observable<T>;
    read: (itemId: number) => Observable<T>;
    delete: (itemId: number) => Observable<boolean>;
}


export class RessourceCrud<T extends MalotruRessource> {

    constructor(
        protected label: string,
        protected malotruInstance: Malotru
    ) { }

    public list(): Observable<T[]> {
        const request = `
            MATCH (${_main}:${this.label}) RETURN ${_main}
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)
            ));
    }

    public update(item: T): Observable<T> {
        const request = updateOfelementRequest(this.label, item);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)[0]
            ));
    }

    public create(item: T): Observable<T> {
        const request = creationOfElementRequest(this.label, item);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)[0]
            ));
    }

    public read(itemId: number): Observable<T> {
        const request = `
            MATCH (${_main}:${this.label}) WHERE ID(${_main})=${itemId} RETURN ${_main}
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res: QueryResult) =>
                formatRecords<T>(res)[0]
            ));
    }

    public delete(itemId: number): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            const request = `
                MATCH 
                    (${_main}:${this.label}) 
                WHERE 
                    ID(${_main})=${itemId} 
                DETACH DELETE ${_main} RETURN ${_main}`;
            this.malotruInstance
                .execute(request)
                .subscribe(
                    () => {
                        observer.next(true);
                        observer.complete();
                    },
                    () => {
                        observer.next(false);
                        observer.complete();
                    }
                );
        })
    }
} 