import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePotentialBandName1728612087623 implements MigrationInterface {
    name = 'CreatePotentialBandName1728612087623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "potential_name" (
                "id" SERIAL NOT NULL,
                "word" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_2d9dce851b1a7e98300017602ff" UNIQUE ("word"),
                CONSTRAINT "PK_352dd2f3d5ff146a03b378f8dbb" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "potential_name"`);
    }

}
