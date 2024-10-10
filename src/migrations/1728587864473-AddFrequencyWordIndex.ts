import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFrequencyWordIndex1728587864473 implements MigrationInterface {
    name = 'AddFrequencyWordIndex1728587864473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_a41635a56c59b0d737d2d0e3e8" ON "word_frequency" ("frequency" DESC, "word") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_a41635a56c59b0d737d2d0e3e8"`);
    }
}
