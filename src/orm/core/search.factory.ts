import { QueryResult } from "neo4j-driver";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { _ignored, _main } from "../constants/malotru.consts";
import { Malotru } from "../malotru";
import { OrientationLink } from "../models/link";
import { MalotruRessource } from "../models/ressource";
import { Search, TargetByLink, TargetRessource } from "../models/search";
import { searchElementRequest } from "../utils/buildRequest";
import { formatRecords } from "../utils/formate";

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
                formatRecords<T>(res)
            ));
    }

    public searchNodesAndLinkedNodesByTarget(
        mainTarget: TargetRessource,
        directNode: TargetByLink,
        targetsByLink: TargetByLink[]
    ) {
        let request = `
            MATCH 
                (${_ignored}:${mainTarget.label}), 
                (${_main}:${directNode.label}) 
            WHERE 
                ID(${_ignored})=${mainTarget.id}
                AND (${_ignored})-[:${directNode.linkLabel}]-(${_main})
        `;
        targetsByLink.forEach((target: TargetByLink) => (
            request += ` OPTIONAL MATCH (${target.returnName}:${target.label})-[:${target.linkLabel}]-(${_main}) `
        ));
        request += ` RETURN ${_main} `;
        targetsByLink.forEach((target: TargetByLink) => {
            request += `, collect(distinct ${target.returnName}) as ${target.returnName}`
        });
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatRecords(res)));
    }

    public searchTargetAndLinkedNodes<T extends MalotruRessource>(
        mainTarget: TargetRessource,
        targetsByLink: TargetByLink[]
    ) {
        let request = `MATCH (${_main}:${mainTarget.label}) WHERE ID(${_main})=${mainTarget.id} `;
        targetsByLink.forEach((target: TargetByLink) => {
            request += ` OPTIONAL MATCH (${target.returnName}:${target.label})-[:${target.linkLabel}]-(${_main}) `
        });
        request += `RETURN ${_main} `;
        targetsByLink.forEach((target: TargetByLink) => {
            request += `, collect(distinct ${target.returnName}) as ${target.returnName}`
        });
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatRecords(res)[0] as T));
    }

    public searchRatachedNodesByLink(
        itemsId: number,
        linkLabel: string,
        orientation: OrientationLink = OrientationLink.Neutre): Observable<MalotruRessource[]> {
        const request = `
            MATCH
                (${_ignored}:${this.sourceLabel})
                    ${orientation === OrientationLink.ToSource ? '<' : ''}-
                    [:${linkLabel}]
                    -${orientation === OrientationLink.ToTarget ? '>' : ''}
                (${_main})
            WHERE
                ID(${_ignored})=${itemsId}
            RETURN
                ${_main}  
        `;
        return this.malotruInstance
            .execute(request)
            .pipe((map((res: QueryResult) => formatRecords(res))));
    }

    public searchNodeByLink(ressource: TargetRessource, target: TargetByLink): Observable<MalotruRessource> {
        const request = `
            MATCH
                (${_ignored}:${ressource.label}),
                (${_main}:${target.label})
            WHERE
                ID(${_ignored})=${ressource.id} AND
                (${_main})-[:${target.linkLabel}]-(${_ignored})
            RETURN 
                ${_main}
        `;
        return this.malotruInstance
            .execute(request)
            .pipe((map((res: QueryResult) => formatRecords(res)[0])));
    }

}