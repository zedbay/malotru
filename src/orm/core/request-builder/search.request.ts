import { _main, _target } from "../../constants/malotru.consts";
import { OrientationLink } from "../../models/link";
import { TargetRessource } from "../../models/search";
import { buildOrientedLink } from "./buildRequest";

export function checkIfLinkExistRequest(targetSource: TargetRessource, targetCible: TargetRessource, linkLabel: string, orientation: OrientationLink): string {
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
    return request;
}