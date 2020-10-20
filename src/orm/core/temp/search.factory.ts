import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { _ignored, _main, _target } from "../../constants/malotru.consts";
import { Malotru } from "../../malotru";
import { MalotruRessource } from "../../models/ressource";
import { Search, TargetByLink, TargetRessource } from "../../models/search";
import { searchElementRequest } from "../request-builder/buildRequest";
import { formatRecords } from "../../utils/formate";

export class SearchFactory {

    constructor(
        public malotruInstance: Malotru
    ) { }

    public search<T extends MalotruRessource>(searchs: Search[], sourceLabel: string): Observable<T[]> {
        const request = searchElementRequest(searchs, sourceLabel);
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


}