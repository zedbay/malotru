import { Router, Express } from "express";
import { PostHandler } from "../handlers/post.handler";

export class PostRouter {

    public static init(express: Express) {
        const router: Router = Router();
        PostRouter.mountPublicRoutes(router);
        PostRouter.mountPrivateRoute(router);
        express.use('/', router);
    }

    private static mountPublicRoutes(router: Router) {
        router.get('/post/comments/:postId', PostHandler.getCommentsInPostHandler);
    }

    private static mountPrivateRoute(router: Router) {
    }


}