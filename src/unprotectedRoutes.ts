import Router from "@koa/router";
import { general, test } from "./controller";

const unprotectedRouter = new Router();

// Hello World route
unprotectedRouter.get("/", general.helloWorld);

//test route
unprotectedRouter.get("/test", test.testing);

export { unprotectedRouter };