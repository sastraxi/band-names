import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBand1728611462339 implements MigrationInterface {
    name = 'CreateBand1728611462339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "band" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "popularity" integer NOT NULL, "spotifyData" jsonb NOT NULL, "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5971cd5a77552fe07e869b36cd4" UNIQUE ("name"), CONSTRAINT "PK_e808d7dacf72163737ce93d7b23" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "band"`);
    }

}
