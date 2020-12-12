/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/type-annotation-spacing */
import { BaseContext } from "koa";
import { request, responsesAll, summary, tagsAll } from "koa-swagger-decorator";
import { ReplOptions } from "repl";
import { User } from "../entity/user";
import { getManager, Repository } from "typeorm";
import { Token } from "../entity/token";
import { MusicLike } from "../entity/musicLike";
import { Music } from "../entity/music";
import { validate, ValidationError } from "class-validator";
import { musicLike } from ".";

@responsesAll({
  200: { descriptoin: "success" },
  400: { description: "bad requset" },
  401: { descriptoin: "unauthorized, missing/wrong jwt token" },
})
@tagsAll(["MusicLike"])
export default class MusicLikeController {
  @request("post", "/music/like/save")
  @summary("create music like")
  public static async createMusicLike(ctx: BaseContext): Promise<void> {
    const UserRepository: Repository<User> = getManager().getRepository(User);
    const TokenRepository: Repository<Token> = getManager().getRepository(
      Token
    );
    const MusicLikeRepository: Repository<MusicLike> = getManager().getRepository(
      MusicLike
    );
    const MusicRepository: Repository<Music> = getManager().getRepository(
      Music
    );

    console.log("Requset: ", ctx.request.body);

    const gottenToken = ctx.request.header.authorization.split(" ")[1];
    // console.log(gottenToken[1]);
    const musicLikeData = ctx.request.body.music_id;
    const findUser = await UserRepository.findOne({
      token: await TokenRepository.findOne({ token: gottenToken }),
    });

    if (findUser) {
      if (musicLikeData) {
        const getMusicData: any = await MusicRepository.findOne({
          id: musicLikeData,
        });
        const getLikeData: any = await MusicLikeRepository.findOne({
          user: findUser,
        });
        console.log(getLikeData);

        const musicLikeToBeSaved: MusicLike = new MusicLike();

        musicLikeToBeSaved.music = getMusicData;
        musicLikeToBeSaved.user = findUser;
        musicLikeToBeSaved.like = ctx.request.body.like;

        console.log("get Music Data", getMusicData);

        console.log("errors");
        const errors: ValidationError[] = await validate(musicLikeToBeSaved);

        if (errors.length > 0) {
          console.log("error");
          ctx.status = 400;
          ctx.body = errors;
        } else if (
          await MusicLikeRepository.findOne({ music: musicLikeToBeSaved.music })
        ) {
          const findMusicData = await MusicLikeRepository.findOne({
            music: getMusicData,
          });

          console.log("findMusicData: ", findMusicData);

          const MusicRemove = await MusicLikeRepository.remove(findMusicData);

          console.log("Music To Be Remove", findMusicData);
          console.log("Remove Data", MusicRemove);

          ctx.status = 204;
        } else {
          const findMusicData = await MusicLikeRepository.findOne({
            music: getMusicData,
          });

          console.log("saved");
          const musicLike = await MusicLikeRepository.save(musicLikeToBeSaved);

          console.log(musicLike);

          console.log(findMusicData);

          ctx.status = 201;
          ctx.body = getMusicData;
        }
      } else {
        console.log("product doesn't exists");
        ctx.status = 400;
        ctx.body = { error: "product doesn't exists" };
      }
    } else {
      ctx.status = 403;
      ctx.body = { error: "token doesn't exists" };
    }
  }
}
