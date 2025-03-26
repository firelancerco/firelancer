import {MigrationInterface, QueryRunner} from "typeorm";

export class ModifyJobPostSchema1742978648680 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "job_post" DROP COLUMN "enabled"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" DROP COLUMN "private"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ADD "visibility" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ADD "currencyCode" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ADD "budget" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "title" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "description" DROP NOT NULL`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "description" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "title" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" DROP COLUMN "budget"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" DROP COLUMN "currencyCode"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" DROP COLUMN "visibility"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ADD "private" boolean NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ADD "enabled" boolean NOT NULL`, undefined);
   }

}
