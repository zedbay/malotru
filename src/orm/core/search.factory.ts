import { QueryResult } from "neo4j-driver";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Malotru } from "../malotru";
import { OrientationLink } from "../models/link";
import { MalotruRessource } from "../models/ressource";
import { Search, TargetByLink, TargetRessource } from "../models/search";
import { searchElementRequest } from "../utils/buildRequest";
import { formateToMalotruResponse } from "../utils/formate";

export class SearchFactory {

    constructor(
        public malotruInstance: Malotru,
        public sourceLabel: string
    ) { }

    public search<T extends MalotruRessource>(searchs: Search[]): Observable<T[]> {
        const request = searchElementRequest(searchs, this.sourceLabel);
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) =>
                formateToMalotruResponse<T>(res).ressources
            ));
    }

    public unknowName(
        mainTarget: TargetRessource,
        targetsByLink: TargetByLink[]
    ) {
        let request = `MATCH (s:${mainTarget.label})`;
        targetsByLink.forEach((targetByLink: TargetByLink) => {
            request += `, (${targetByLink.returnName}:${targetByLink.label})`
        });
        request += ` WHERE ID(s)=${mainTarget.id}`;
        targetsByLink.forEach((targetsByLink: TargetByLink) => {
            request += ` AND (s)-[:${targetsByLink.linkLabel}]-(${targetsByLink.returnName})`
        });
        request += ` RETURN s`;
        targetsByLink.forEach((targetsByLink: TargetByLink) => {
            request += `, ${targetsByLink.returnName}`
        });
        return this.malotruInstance
            .execute(request);
        console.log(request);
        //     WHERE 
        //         ID(s)=${mainTarget.id}
        //     RETURN
        //         s
        // `;
    }

    public searchRatachedNodesByLink(
        itemsId: number,
        linkLabel: string,
        orientation: OrientationLink = OrientationLink.Neutre): Observable<MalotruRessource[]> {
        const request = `
            MATCH
                (s:${this.sourceLabel})
                    ${orientation === OrientationLink.ToSource ? '<' : ''}-
                    [:${linkLabel}]
                    -${orientation === OrientationLink.ToTarget ? '>' : ''}
                (l)
            WHERE
                ID(s)=${itemsId}
            RETURN
                l  
        `;
        return this.malotruInstance
            .execute(request)
            .pipe((map((res: QueryResult) => formateToMalotruResponse(res).ressources)));
    }

    public searchNodeByLink(target: TargetRessource, nodeLabel: string, linkLabel: string): Observable<MalotruRessource> {
        const request = `
            MATCH
                (s:${nodeLabel}),
                (t:${target.label})
            WHERE
                ID(t)=${target.id} AND
                (s)-[:${linkLabel}]-(t)
            RETURN 
                s, t
        `;
        return this.malotruInstance
            .execute(request)
            .pipe((map((res: QueryResult) => formateToMalotruResponse(res).ressources[0])));
    }

}