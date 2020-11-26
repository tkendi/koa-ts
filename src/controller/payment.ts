/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseContext } from "koa";
import { request, responsesAll, summary } from "koa-swagger-decorator";
import { getManager, Repository, Equal, Not, createConnection } from "typeorm";
import { IsEmail, validate, ValidationError } from "class-validator";

import { User } from "../entity/user";

import {
  Payment,
  uuidv4,
  getToken,
  issueBilling,
  normalPayment,
  bookedPayment,
} from "../entity/payment";
import { ConsoleTransportOptions } from "winston/lib/winston/transports";
import { decoded } from "../entity/token";

@responsesAll(["Payment"])
export default class PaymentController {
  @request("post", "/payment/pay")
  @summary("payment User Product")
  public static async createOrder(ctx: BaseContext): Promise<void> {
    // const UserPayment = IamportPayment();
    // console.log(UserPayment);
    console.log("Payment");
  }

  @request("post", "/payment/create")
  @summary("create payment info")
  public static async createPaymentInfo(ctx: BaseContext): Promise<void> {
    //get a payment to perform operations with paymenrt
    const paymentRepository: Repository<Payment> = await getManager().getRepository(
      Payment
    );
    const userRepository: Repository<User> = await getManager().getRepository(
      User
    );

    const headers = ctx.response.header;
    decoded(headers);

    //craete random customer uuid
    const uuid = uuidv4();

    //create entity
    //build up entity payment info to be saved
    const paymentToBeSaved: Payment = new Payment();
    const userToBeSaved: User = new User();
    //v alidate payment entity
    const errorsPayment: ValidationError[] = await validate(paymentToBeSaved);
    const errorsUser: ValidationError[] = await validate(userToBeSaved);

    paymentToBeSaved.cardNumber = ctx.request.body.cardNumber;
    paymentToBeSaved.cardExpire = ctx.request.body.cardExpire;
    paymentToBeSaved.birth = ctx.request.body.birth;
    paymentToBeSaved.cardPassword2digit = ctx.request.body.cardPassword2digit;
    paymentToBeSaved.customerUid = uuid;
    paymentToBeSaved.user = userToBeSaved;

    userToBeSaved.payment = paymentToBeSaved;

    // generate billing key
    // console.log(
    //   await issueBilling(
    //     paymentToBeSaved.customerUid,
    //     await getToken(),
    //     paymentToBeSaved.cardNumber,
    //     paymentToBeSaved.cardExpire,
    //     paymentToBeSaved.birth,
    //     paymentToBeSaved.cardPassword2digit
    //   )
    // );

    // cehcking user token
    console.log(
      await (await userRepository.find()).map((cur, index) => {
        console.log(cur, "asdfasdfasdf");
      })
    );

    //checking user relations with payment
    const userRelation = await paymentRepository.find({ relations: ["user"] });
    const paymentRelation = await userRepository.find({
      relations: ["payment"],
    });
    console.log(userRelation);
    console.log(paymentRelation);

    if (errorsPayment.length > 0) {
      ctx.status = 400;
      ctx.body = errorsPayment;
    } else if (!(userRelation[0].user.index === paymentRelation[0].index)) {
      ctx.status = 400;
      ctx.body = "User doesn't exists";
    } else if (
      await paymentRepository.findOne({
        cardNumber: paymentToBeSaved.cardNumber,
      })
    ) {
      ctx.status = 400;
      ctx.body = "CardNumber already exists";
    } else if (
      await paymentRepository.findOne({ birth: paymentToBeSaved.birth })
    ) {
      ctx.status = 400;
      ctx.body = "Brith already exists";
    } else if (errorsUser.length > 0) {
      ctx.status = 400;
      ctx.body = errorsUser;
    } else {
      await paymentRepository.save(paymentToBeSaved);
      const user = await userRepository.save(userToBeSaved);
      console.log(user);
      ctx.status = 201;
    }
  }

  @request("post", "/payment/normalpayment")
  @summary("normal payment")
  public static async normalPayment(ctx: BaseContext): Promise<void> {
    const normalPaymentRepository: Repository<Payment> = getManager().getRepository(
      Payment
    );

    let userCustomerUid: any = null;

    const normalPayments: Payment[] = await normalPaymentRepository.find();

    normalPayments.map((cur, index) => {
      userCustomerUid = cur.customerUid;
    });

    console.log(
      await normalPayment(
        await getToken(),
        userCustomerUid,
        "order_monthly_0001",
        200,
        "일반결제 테스트"
      )
    );
  }

  @request("post", "/payment/booked")
  @summary("booked payment")
  public static async bookedPayment(ctx: BaseContext): Promise<void> {
    const bookedPaymentRepository: Repository<Payment> = getManager().getRepository(
      Payment
    );

    let userCustomerUid: any = null;

    const bookedPayments: Payment[] = await bookedPaymentRepository.find();

    bookedPayments.map((cur, index) => {
      userCustomerUid = cur.customerUid;
    });

    // console.log(
    //   await bookedPayment(
    //     userCustomerUid,
    //     "order_monthly_0001",
    //     200,
    //     "월간 이용권 정기 결제 테스팅"
    //   )
    // );
  }
}
