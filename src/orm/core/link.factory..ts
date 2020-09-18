import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Link } from "../models/link";
import { Orientation } from "../models/orientation";
import { Target } from "../models/target";
import { formatLinkCreation } from "../utils/formate";
import { Malotru } from "../malotru";

export class LinkFactory {

    constructor(
        public malotruInstance: Malotru,
        public sourceLabel: string
    ) { }

    public createLink(itemId: number, linkLabel: string, target: Target, orientation: Orientation = Orientation.Neutre): Observable<Link> {
        const request = `
                MATCH 
                    (u:${this.sourceLabel}),
                    (t:${target.label})
                WHERE 
                    ID(u)=${itemId} AND
                    ID(t)=${target.id}
                CREATE
                    (u)${orientation === Orientation.ToSource ? '<' : ''}-[:${linkLabel}]-${orientation === Orientation.ToTarget ? '>' : ''}(t)
                RETURN
                    u, t
            `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLinkCreation(res)));
    }

    public listLinkTarget(itemsId: number, linkLabel: string, orientation: Orientation = Orientation.Neutre) {
        const request = `
                MATCH
                    (u:${this.sourceLabel})${orientation === Orientation.ToSource ? '<' : ''}-[:${linkLabel}]-${orientation === Orientation.ToTarget ? '>' : ''}(l)
                WHERE
                    ID(u)=${itemsId}
                RETURN
                    l  
            `;
        return this.malotruInstance.execute(request);
    }

    public deleteLink(itemsId: number, linkLabel: string, target: Target, orientation: Orientation = Orientation.Neutre) {
        const request = `
                MATCH
                    (u:${this.sourceLabel})-[l:${linkLabel}]${orientation === Orientation.ToSource ? '<' : ''}-${orientation === Orientation.ToTarget ? '>' : ''}(t:${target.label})
                WHERE
                    ID(u)=${itemsId} AND
                    ID(t)=${target.id}
                DETACH DELETE 
                    l
            `;
        return this.malotruInstance.execute(request);
    }

}