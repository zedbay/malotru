import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Malotru } from "../malotru";
import { Link, OrientationLink } from "../models/link";
import { TargetRessource } from "../models/search";
import { formatLink } from "../utils/formate";
import { checkIfLinkExistRequest } from "./request-builder/search.request";
import { createLinkRequest, deleteLinkRequest, deleteNodeByLinkRelationRequest } from "./request-builder/link.request";

export class MalotruLink {

    constructor(
        private malotruInstance: Malotru,
        private linkLabel: string,
        private sourceLabel: string
    ) { }

    public checkIfLinkExist(ressourceId: number, target: TargetRessource, orientation: OrientationLink = OrientationLink.Neutre): Observable<Link> {
        const request = checkIfLinkExistRequest(
            { id: ressourceId, label: this.sourceLabel },
            target,
            this.linkLabel,
            orientation
        );
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)));
    }

    public createLink(ressourceId: number, target: TargetRessource, orientation: OrientationLink): Observable<Link> {
        const request = createLinkRequest(
            { id: ressourceId, label: this.sourceLabel },
            this.linkLabel,
            target,
            orientation
        );
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)));
    }

    public deleteLink(ressourceId: number, target: TargetRessource, orientation: OrientationLink = OrientationLink.Neutre): Observable<void> {
        const request = deleteLinkRequest(
            { id: ressourceId, label: this.sourceLabel },
            this.linkLabel,
            target,
            orientation
        );
        return this.malotruInstance.execute(request);
    }

    public deleteRatachedNodes(ressourceId: number, targetLabel: string, orientation: OrientationLink = OrientationLink.Neutre): Observable<void> {
        const request = deleteNodeByLinkRelationRequest(
            targetLabel,
            { id: ressourceId, label: this.sourceLabel },
            this.linkLabel,
            orientation
        )
        return this.malotruInstance.execute(request);
    }

}