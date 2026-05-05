/*
  Warnings:

  - You are about to drop the column `curso` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `faltas` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `horario` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `horasRealizadas` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `parcelaAtual` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `percentualConclusao` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `situacaoPagamento` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `totalHorasCurso` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `totalParcelas` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `turno` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `ultimaSincronizacao` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `valorMensalidade` on the `Aluno` table. All the data in the column will be lost.
  - You are about to drop the column `curso` on the `ConfiguracaoSheet` table. All the data in the column will be lost.
  - You are about to drop the column `turno` on the `ConfiguracaoSheet` table. All the data in the column will be lost.
  - Added the required column `turmaId` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turmaId` to the `ConfiguracaoSheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "curso",
DROP COLUMN "faltas",
DROP COLUMN "horario",
DROP COLUMN "horasRealizadas",
DROP COLUMN "parcelaAtual",
DROP COLUMN "percentualConclusao",
DROP COLUMN "situacaoPagamento",
DROP COLUMN "totalHorasCurso",
DROP COLUMN "totalParcelas",
DROP COLUMN "turno",
DROP COLUMN "ultimaSincronizacao",
DROP COLUMN "valorMensalidade",
ADD COLUMN     "senha" TEXT,
ADD COLUMN     "turmaId" TEXT NOT NULL,
ALTER COLUMN "situacaoMatricula" SET DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "ConfiguracaoSheet" DROP COLUMN "curso",
DROP COLUMN "turno",
ADD COLUMN     "turmaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Turma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcela" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,
    "dataPagamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "Parcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamada" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "Chamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "chamadaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "arquivo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_chamadaId_alunoId_key" ON "Presenca"("chamadaId", "alunoId");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcela" ADD CONSTRAINT "Parcela_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chamada" ADD CONSTRAINT "Chamada_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_chamadaId_fkey" FOREIGN KEY ("chamadaId") REFERENCES "Chamada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
