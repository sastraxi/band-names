import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLowerBandNameIndex1728611567045 implements MigrationInterface {
    name = 'AddLowerBandNameIndex1728611567045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_LOWER_BAND_NAME" ON "band" (LOWER("name")) `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_LOWER_BAND_NAME"`);
    }

}
