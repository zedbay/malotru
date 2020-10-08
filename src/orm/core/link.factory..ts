import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Link, OrientationLink } from "../models/link";
import { formatLink } from "../utils/formate";
import { Malotru } from "../malotru";
import { TargetRessource } from "../models/search";
import { _ignored, _main, _target } from "../constants/malotru.consts";
import { buildOrientedLink } from "../utils/buildRequest";

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
                    (${_main})${buildOrientedLink(linkLabel, orientation)}(${_target})
                RETURN
                    ${_main}, ${_target}
            `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)));
    }

    public checkIfLinkExist(targetSource: TargetRessource, targetCible: TargetRessource, linkLabel: string, orientation: OrientationLink = OrientationLink.Neutre): Observable<Link> {
        const request = `
            MATCH
                (${_main}:${targetSource.label}),
                (${_target}:${targetCible.label})
            WHERE
                ID(${_main})=${targetSource.id} AND
                ID(${_target})=${targetCible.id} AND
                (${_main})${buildOrientedLink(linkLabel, orientation)}(${_target})
            RETURN
                ${_main}, ${_target}
        `;
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)));
    }

    public deleteLink(itemsId: number, linkLabel: string, target: TargetRessource, orientation: OrientationLink = OrientationLink.Neutre): Observable<void> {
        const nameOfLinkToDelete = 'to_delete';
        const request = `
                MATCH
                    (${_main}:${this.sourceLabel})
                    ${buildOrientedLink(linkLabel, orientation, nameOfLinkToDelete)}
                    (${_target}:${target.label})
                WHERE
                    ID(${_main})=${itemsId} AND
                    ID(${_target})=${target.id}
                DETACH DELETE 
                    ${nameOfLinkToDelete}
            `;
        return this.malotruInstance.execute(request);
    }

    public deleteNodeByLinkRelation(targetLabel: string, source: TargetRessource, linkLabel: string, orientation: OrientationLink = OrientationLink.Neutre): Observable<void> {
        const request = `
            MATCH
                (${_main}:${targetLabel}),
                (${_target}:${source.label})
            WHERE
                ID(${_target})=${source.id} AND
                (${_main})${buildOrientedLink(linkLabel, orientation)}(${_target})
            DETACH DELETE
                ${_main}
        `;
        return this.malotruInstance.execute(request);
    }

}