import { Observable } from "rxjs";
import { MalotruRessource } from "../../models/ressource";
import { _main } from "../../constants/malotru.consts";


export interface CrudI<T extends MalotruRessource> {
    list: () => Observable<T[]>;
    update: (item: T) => Observable<T>;
    create: (item: T) => Observable<T>;
    read: (itemId: number) => Observable<T>;
    delete: (itemId: number) => Observable<boolean>;
}