import { _main, _target } from "../../constants/malotru.consts";
import { OrientationLink } from "../../models/link";
import { TargetRessource } from "../../models/search";
import { buildOrientedLink } from "./buildRequest";

export function createLinkRequest(targetSource: TargetRessource, linkLabel: string, target: TargetRessource, orientation: OrientationLink): string {
    const request = `
            MATCH 
                (${_main}:${targetSource.label}),
                (${_target}:${target.label})
            WHERE 
                ID(${_main})=${targetSource.id} AND
                ID(${_target})=${target.id}
            CREATE
                (${_main})${buildOrientedLink(linkLabel, orientation)}(${_target})
            RETURN
                ${_main}, ${_target}
        `;
    return request;
}

export function deleteLinkRequest(targetSource: TargetRessource, linkLabel: string, target: TargetRessource, orientation: OrientationLink = OrientationLink.Neutre): string {
    const nameOfLinkToDelete = 'to_delete';
    const request = `
            MATCH
                (${_main}:${targetSource.label})
                ${buildOrientedLink(linkLabel, orientation, nameOfLinkToDelete)}
                (${_target}:${target.label})
            WHERE
                ID(${_main})=${targetSource.id} AND
                ID(${_target})=${target.id}
            DETACH DELETE 
                ${nameOfLinkToDelete}
        `;
    return request;
}

export function deleteNodeByLinkRelationRequest(targetLabel: string, source: TargetRessource, linkLabel: string, orientation: OrientationLink = OrientationLink.Neutre): string {
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
    return request;
}