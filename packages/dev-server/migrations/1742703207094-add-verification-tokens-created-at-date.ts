import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVerificationTokensCreatedAtDate1742703207094 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "authentication_method" ADD "verificationTokenCreatedAt" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "authentication_method" ADD "passwordResetTokenCreatedAt" TIMESTAMP`, undefined);
        await queryRunner.query(`ALTER TABLE "authentication_method" ADD "identifierChangeTokenCreatedAt" TIMESTAMP`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "authentication_method" DROP COLUMN "identifierChangeTokenCreatedAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "authentication_method" DROP COLUMN "passwordResetTokenCreatedAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "authentication_method" DROP COLUMN "verificationTokenCreatedAt"`, undefined);
   }

}
