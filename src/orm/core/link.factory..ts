import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Link, OrientationLink } from "../models/link";
import { formatLinkCreation } from "../utils/formate";
import { Malotru } from "../malotru";
import { TargetRessource } from "../models/search";

export class LinkFactory {

    constructor(
        public malotruInstance: Malotru,
        public sourceLabel: string
    ) { }

    public createLink(itemId: number, linkLabel: string, target: TargetRessource, orientation: OrientationLink): Observable<Link> {
        const request = `
                MATCH 
                    (s:${this.sourceLabel}),
                    (t:${target.label})
                WHERE 
                    ID(s)=${itemId} AND
                    ID(t)=${target.id}
                CREATE
                    (s)${orientation === OrientationLink.ToSource ? '<' : ''}-[:${linkLabel}]-${orientation === OrientationLink.ToTarget ? '>' : ''}(t)
                RETURN
                    s, t
            `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLinkCreation(res)));
    }

    public checkIfLinkExist(targetSource: TargetRessource, targetCible: TargetRessource, linkLabel: string): Observable<Link> {
        const request = `
            MATCH
                (s:${targetSource.label}),
                (t:${targetCible.label})
            WHERE
                ID(s)=${targetSource.id} AND
                ID(t)=${targetCible.id} AND
                (s)-[:${linkLabel}]-(t)
            RETURN
                s, t
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLinkCreation(res)));
    }

    public deleteLink(itemsId: number, linkLabel: string, target: TargetRessource, orientation: OrientationLink = OrientationLink.Neutre): Observable<void> {
        const request = `
                MATCH
                    (s:${this.sourceLabel})-[l:${linkLabel}]${orientation === OrientationLink.ToSource ? '<' : ''}-${orientation === OrientationLink.ToTarget ? '>' : ''}(t:${target.label})
                WHERE
                    ID(s)=${itemsId} AND
                    ID(t)=${target.id}
                DETACH DELETE 
                    l
            `;
        return this.malotruInstance.execute(request);
    }

    public deleteNodeByLinkRelation(targetLabel: string, source: TargetRessource, linkLabel: string): Observable<void> {
        const request = `
            MATCH
                (s:${targetLabel}),
                (t:${source.label})
            WHERE
                ID(t)=${source.id} AND
                (s)-[:${linkLabel}]-(t)
            DETACH DELETE
                s
        `;
        return this.malotruInstance.execute(request);
    }

}