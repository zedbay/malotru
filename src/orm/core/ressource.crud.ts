import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MalotruRessource } from "../models/ressource";
import { Search } from "../models/search";
import { creationOfElementRequest, searchElementRequest, updateOfelementRequest } from "../utils/buildRequest";
import { formatMultipleElements, formatOneElement } from "../utils/formate";
import { Malotru } from "../malotru";

export abstract class RessourceCrud<T extends MalotruRessource> {

    constructor(
        protected label: string,
        protected malotruInstance: Malotru
    ) { }

    public search(searchs: Search[]): Observable<T[]> {
        const request = searchElementRequest(searchs, this.label);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatMultipleElements(res)));
    }

    public list(): Observable<T[]> {
        const request = `
            MATCH (u:${this.label}) RETURN u
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatMultipleElements(res)));
    }

    public update(item: T): Observable<T> {
        const request = updateOfelementRequest(this.label, item);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatOneElement(res)));
    }

    public create(item: T): Observable<T> {
        const request = creationOfElementRequest(this.label, item);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatOneElement(res)));
    }

    public read(itemId: number): Observable<T> {
        const request = `
            MATCH (u:${this.label}) WHERE ID(u)=${itemId} RETURN u
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatOneElement(res)));
    }

    public delete(itemId: number): Observable<void> {
        const request = `
            MATCH (u:${this.label}) WHERE ID(u)=${itemId} DETACH DELETE u RETURN u
        `;
        return this.malotruInstance
            .execute(request);
    }
} 