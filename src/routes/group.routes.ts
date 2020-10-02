import { Router, Express } from "express";
import { GroupHandler } from "../handlers/group.handler";
import { checkJwt } from "../security/checkJwt.middleware";

export class GroupRouter {

    public static init(express: Express) {
        const router: Router = Router();
        GroupRouter.mountPrivateRoute(router);
        GroupRouter.mountPublicRoutes(router);
        express.use('/', router);
    }

    public static mountPrivateRoute(router: Router) {
        router.post('/group', checkJwt, GroupHandler.createGroupHandler);
    }

    public static mountPublicRoutes(router: Router) {
        router.get('/group', GroupHandler.listGroupHandler);
        router.get('/group/members/:groupId', GroupHandler.getGroupMembersHandler);
        router.put('/group/join/:groupId', checkJwt, GroupHandler.joinGroupHandler);
        router.get('/group/:groupId', GroupHandler.getGroupHandler);
        router.get('/group/feed/:groupId', GroupHandler.getFeedHandler);
    }
}