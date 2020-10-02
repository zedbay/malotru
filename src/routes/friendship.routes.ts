import { Router, Express } from "express";
import { FriendshipHandler } from "../handlers/friendship.handler";
import { checkJwt } from "../security/checkJwt.middleware";

export class FriendshipRouter {

    public static init(express: Express) {
        const router: Router = Router();
        FriendshipRouter.mountPublicRoutes(router);
        FriendshipRouter.mountPrivateRoute(router);
        express.use('/', router);
    }

    private static mountPublicRoutes(router: Router) {

    }

    private static mountPrivateRoute(router: Router) {
        router.get('/friendship', checkJwt, FriendshipHandler.getFriendRequest);
        router.post('/friendship/:userTargetId', checkJwt, FriendshipHandler.createFriendshipRequest);
        router.put('/handlefriendship/:userTargetId', checkJwt, FriendshipHandler.handleFriendRequest)
    }


}