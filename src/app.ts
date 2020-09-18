import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as config from '../config.json';
import { MainRouter } from './routes/main.routes';
import { Malotru } from './orm/malotru';
import { Observable } from 'rxjs';

class App {

    public express: express.Express = express();
    public router: MainRouter;
    public bdd: Malotru;

    constructor() {
        this.mountMiddleWare();
        this.initBdd().subscribe((success: boolean) => {
            if (success) {
                console.log('Successfully connected to neo4j');
                this.router = new MainRouter(this.express);
            } else {
                console.log('Connection to neo4j failed :(');
            }
        });
    }

    private initBdd(): Observable<boolean> {
        return new Observable((observer) => {
            Malotru.initMalotru(
                `bolt://localhost:${config['neo4j']['host']}`,
                config['neo4j']['bdd'],
                config['neo4j']['password']
            ).subscribe((malotruInstance) => {
                if (!malotruInstance) {
                    observer.next(false);
                } else {
                    this.bdd = malotruInstance;
                    observer.next(true);
                }
                observer.complete();
            });
        });
    }


    private mountMiddleWare(): void {
        this.express.use(cors({
            credentials: true, origin: [
                'http://localhost:4200',
                'http://localhost:3000'
            ]
        }));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

}

const app = new App();

app.express.listen(config['port'], () => {
    console.log(`Server running on port ${config['port']}`);
});

export function getNeo4jInstance(): Malotru {
    return app.bdd;
}
