/* eslint-disable @typescript-eslint/no-unused-vars */
import { Collection } from "iamport-rest-client-nodejs/dist/response";
import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { FolderMusic } from "./memo";
import { Music } from "./music";
import { User } from "./user";

@Entity()
export class Folder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @ManyToOne((type) => User, (user) => user.folder)
  @JoinColumn({ name: "user_index" })
  user?: User;

  @OneToMany((type) => FolderMusic, (folderMusic) => folderMusic.folder, {
    onDelete: "SET NULL",
    cascade: true,
  })
  @JoinColumn({ name: "memo_index" })
  folderMusic?: FolderMusic;

  @CreateDateColumn()
  createdat: Date;

  @UpdateDateColumn()
  updatedat: Date;
}
