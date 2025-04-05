import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeTimestampToTimestamptz1743875670188 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "balance_entry" ADD CONSTRAINT "CHK_d0585709b1da007a151d90ad82" CHECK ("settledAt" IS NULL OR "rejectedAt" IS NULL)`, undefined);
        await queryRunner.query(`ALTER TABLE "balance_entry" ADD CONSTRAINT "CHK_1d327a108f69d3eda73b5b50ca" CHECK (("prevSettledAt" IS NULL AND "prevBalance" IS NULL) OR ("prevSettledAt" IS NOT NULL AND "prevBalance" IS NOT NULL))`, undefined);
        await queryRunner.query(`ALTER TABLE "balance_entry" ADD CONSTRAINT "CHK_88b99ce1e581e28ffe2307cf87" CHECK ("prevSettledAt" < "settledAt")`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "balance_entry" DROP CONSTRAINT "CHK_88b99ce1e581e28ffe2307cf87"`, undefined);
        await queryRunner.query(`ALTER TABLE "balance_entry" DROP CONSTRAINT "CHK_1d327a108f69d3eda73b5b50ca"`, undefined);
        await queryRunner.query(`ALTER TABLE "balance_entry" DROP CONSTRAINT "CHK_d0585709b1da007a151d90ad82"`, undefined);
   }

}
