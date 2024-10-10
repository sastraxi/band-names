import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWordFrequency1728587017405 implements MigrationInterface {
    name = 'CreateWordFrequency1728587017405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "word_frequency" (
                "id" SERIAL NOT NULL, 
                "word" character varying NOT NULL, 
                "frequency" integer NOT NULL, 
                CONSTRAINT "UQ_4b7df469f6d705ec15ff6d499a1" UNIQUE ("word"), 
                CONSTRAINT "PK_55083570a0ffd9d3510e73ca07c" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "word_frequency"`);
    }

}
