import { MigrationInterface, QueryRunner } from "typeorm";

export class ProcessedFile1728591588330 implements MigrationInterface {
    name = 'ProcessedFile1728591588330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "processed_file" (
                "id" SERIAL NOT NULL, 
                "filename" character varying NOT NULL, 
                "processedAt" TIMESTAMP NOT NULL, 
                CONSTRAINT "PK_cd995b10ed727a9f811272f68ab" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "processed_file"`);
    }

}
