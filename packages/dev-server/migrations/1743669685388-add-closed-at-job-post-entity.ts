import {MigrationInterface, QueryRunner} from "typeorm";

export class AddClosedAtJobPostEntity1743669685388 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "job_post" ADD "closedAt" TIMESTAMP`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "job_post" DROP COLUMN "closedAt"`, undefined);
   }

}
