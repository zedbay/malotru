import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Link, OrientationLink } from "../models/link";
import { formatLink } from "../utils/formate";
import { Malotru } from "../malotru";
import { TargetRessource } from "../models/search";
import { _main, _target } from "../constants/malotru.consts";

export class LinkFactory {

    constructor(
        public malotruInstance: Malotru,
        public sourceLabel: string
    ) { }

    public createLink(itemId: number, linkLabel: string, target: TargetRessource, orientation: OrientationLink): Observable<Link> {
        const request = `
                MATCH 
                    (${_main}:${this.sourceLabel}),
                    (${_target}:${target.label})
                WHERE 
                    ID(${_main})=${itemId} AND
                    ID(${_target})=${target.id}
                CREATE
                    (${_main})${orientation === OrientationLink.ToSource ? '<' : ''}-[:${linkLabel}]-${orientation === OrientationLink.ToTarget ? '>' : ''}(${_target})
                RETURN
                    ${_main}, ${_target}
            `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)));
    }

    public checkIfLinkExist(targetSource: TargetRessource, targetCible: TargetRessource, linkLabel: string): Observable<Link> {
        const request = `
            MATCH
                (${_main}:${targetSource.label}),
                (${_target}:${targetCible.label})
            WHERE
                ID(${_main})=${targetSource.id} AND
                ID(${_target})=${targetCible.id} AND
                (${_main})-[:${linkLabel}]-(${_target})
            RETURN
                ${_main}, ${_target}
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)));
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
                (${_main}:${targetLabel}),
                (t:${source.label})
            WHERE
                ID(t)=${source.id} AND
                (${_main})-[:${linkLabel}]-(t)
            DETACH DELETE
                ${_main}
        `;
        return this.malotruInstance.execute(request);
    }

}