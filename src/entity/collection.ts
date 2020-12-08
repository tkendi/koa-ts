/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Collection extends BaseEntity {
  @PrimaryGeneratedColumn()
  index: number;

  @Column()
  image: string;

  @Column({ nullable: true })
  social_insta: string;

  @Column({ nullable: true })
  social_twitter: string;

  @Column({ nullable: true })
  social_facebook: string;

  @Column()
  title: string;

  @Column()
  description: string;
}
