import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';
import { Observable, Subscriber } from 'rxjs';
import { LinkFactory } from './core/link.factory.';
import { RessourceCrud } from "./core/ressource.crud";
import { MalotruRessource } from "./models/ressource";

export class Malotru {

    constructor(
        protected driver: Driver, protected session: Session
    ) { }

    public static initMalotru(url: string, bddName: string, password: string): Observable<Malotru> {
        return new Observable((observer: Subscriber<Malotru>) => {
            const driver: Driver = neo4j.driver(
                url,
                neo4j.auth.basic(bddName, password)
            );
            driver.verifyConnectivity()
                .then(() => {
                    const session: Session = driver.session();
                    const malotruInstance = new Malotru(driver, session);
                    observer.next(malotruInstance);
                    observer.complete();
                })
                .catch(() => {
                    observer.next(undefined);
                    observer.complete();
                });
        });
    }

    public execute(request: string): Observable<any> {
        return new Observable((observer: Subscriber<any>) => {
            this.session.run(request).then((res: QueryResult) => {
                observer.next(res);
                observer.complete();
            });
        });
    }

    public closeDriver() {
        return this.driver.close();
    }

}

export abstract class MalotruObject<T extends MalotruRessource> extends RessourceCrud<T> {

    protected linkFactory: LinkFactory;

    constructor(
        protected label: string,
        protected malotruInstance: Malotru
    ) {
        super(
            label,
            malotruInstance
        );
        this.linkFactory = new LinkFactory(malotruInstance, label);
    }

}

