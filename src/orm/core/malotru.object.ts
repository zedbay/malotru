import { Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { Malotru } from "../malotru";
import { MalotruRessource } from "../models/ressource";
import { formatRecords } from "../utils/formate";
import { CrudI } from "./interfaces/crud.interface";
import { MalotruLink } from "./malotru.link";
import { createRequest, deleteRequest, listRequest, readRequest, updateRequest } from "./request-builder/crud.request";
import { SearchFactory } from "./temp/search.factory";

export abstract class MalotruObject<T extends MalotruRessource> implements CrudI<T> {

    public searchFactory: SearchFactory;

    public links: { [linkLabel: string]: MalotruLink } = {};

    constructor(
        protected label: string,
        protected malotruInstance: Malotru,
        protected linkLabels: string[] = []
    ) {
        this.searchFactory = new SearchFactory(malotruInstance);

        this.linkLabels.forEach((linkLabel: string) => {
            this.links[linkLabel] = new MalotruLink(
                malotruInstance,
                linkLabel,
                label
            );
        });
    }

    public list(): Observable<T[]> {
        const request = listRequest(this.label);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)
            ));
    }

    public delete(itemId: number): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            const request = deleteRequest(itemId);
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

    public update(item: T): Observable<T> {
        const request = updateRequest(item, this.label);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)[0]
            ));
    }

    public create(item: T): Observable<T> {
        const request = createRequest(item, this.label);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)[0]
            ));
    }

    public read(itemId: number): Observable<T> {
        const request = readRequest(itemId);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formatRecords<T>(res)[0]
            ));
    }

}