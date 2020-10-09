import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';
import { Observable, Subscriber } from 'rxjs';
import { MalotruObject } from './core/malotru.object';

export class Malotru {

    public static malotruObject = MalotruObject;

    constructor(
        protected driver: Driver
    ) { }

    public static initMalotru(url: string, bddName: string, password: string): Observable<Malotru> {
        return new Observable((observer: Subscriber<Malotru>) => {
            const driver: Driver = neo4j.driver(
                url,
                neo4j.auth.basic(bddName, password),
                { disableLosslessIntegers: true }
            );
            driver.verifyConnectivity()
                .then(() => {
                    const malotruInstance = new Malotru(driver);
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
        const session: Session = this.driver.session();
        return new Observable((observer: Subscriber<QueryResult>) => {
            session.run(request)
                .then((res: QueryResult) => {
                    observer.next(res);
                    observer.complete();
                })
                .catch((err) => {
                    observer.error(err);
                    observer.complete();
                })
                .then(() => {
                    session.close();
                });
        });
    }

    public closeDriver() {
        return this.driver.close();
    }

}
