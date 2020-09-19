import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Link, OrientationLink, TargetLink } from "../models/link";
import { formatLinkCreation } from "../utils/formate";
import { Malotru } from "../malotru";

export class LinkFactory {

    constructor(
        public malotruInstance: Malotru,
        public sourceLabel: string
    ) { }

    public createLink(itemId: number, linkLabel: string, target: TargetLink, orientation: OrientationLink): Observable<Link> {
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

    public listLinkTarget(itemsId: number, linkLabel: string, orientation: OrientationLink = OrientationLink.Neutre) {
        const request = `
                MATCH
                    (s:${this.sourceLabel})${orientation === OrientationLink.ToSource ? '<' : ''}-[:${linkLabel}]-${orientation === OrientationLink.ToTarget ? '>' : ''}(l)
                WHERE
                    ID(s)=${itemsId}
                RETURN
                    l  
            `;
        return this.malotruInstance.execute(request);
    }

    public deleteLink(itemsId: number, linkLabel: string, target: TargetLink, orientation: OrientationLink = OrientationLink.Neutre) {
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

}