import { Observable, Subscriber } from "rxjs";
import { map } from "rxjs/operators";
import { Malotru } from "../malotru";
import { Link, OrientationLink } from "../models/link";
import { TargetRessource } from "../models/search";
import { formatLink, formatRecords } from "../utils/formate";
import { checkIfLinkExistRequest } from "./request-builder/search.request";
import { createLinkRequest, deleteLinkRequest, deleteNodeByLinkRelationRequest, listRatachedNodesRequest } from "./request-builder/link.request";
import { QueryResult } from "neo4j-driver";

export class MalotruLink {

    constructor(
        private malotruInstance: Malotru,
        private linkLabel: string,
        private sourceLabel: string
    ) { }

    public switchLink(ressourceId: number, target: TargetRessource, orientation: OrientationLink): Observable<boolean> {
        return new Observable((observer: Subscriber<boolean>) => {
            this.checkIfLinkExist(ressourceId, target, orientation).subscribe((exist: boolean) => {
                if (exist) {
                    this.deleteLink(ressourceId, target, orientation).subscribe(() => {
                        observer.next(!exist);
                        observer.complete();
                    });
                } else {
                    this.createLink(ressourceId, target, orientation).subscribe(() => {
                        observer.next(!exist);
                        observer.complete();
                    });
                }
            });
        })
    }

    public listRatachedNodes(ressourceId: number, orientation: OrientationLink = OrientationLink.Neutre) {
        const request = listRatachedNodesRequest(
            { id: ressourceId, label: this.sourceLabel },
            this.linkLabel,
            orientation
        )
        return this.malotruInstance
            .execute(request)
            .pipe((map((res: QueryResult) => formatRecords(res))));
    }

    public checkIfLinkExist(ressourceId: number, target: TargetRessource, orientation: OrientationLink = OrientationLink.Neutre): Observable<boolean> {
        const request = checkIfLinkExistRequest(
            { id: ressourceId, label: this.sourceLabel },
            target,
            this.linkLabel,
            orientation
        );
        return this.malotruInstance
            .execute(request)
            .pipe(map((res) => formatLink(res)))
            .pipe((map((res) => {
                return res !== undefined;
            })));
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