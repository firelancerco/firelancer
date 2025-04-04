import {MigrationInterface, QueryRunner} from "typeorm";

export class SetVisibilityFieldNotNull1743779179241 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "title"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "visibility" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "visibility" SET DEFAULT 'PUBLIC'`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "visibility" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" ALTER COLUMN "visibility" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "customer" ADD "title" character varying`, undefined);
   }

}
