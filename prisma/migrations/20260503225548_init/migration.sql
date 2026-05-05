-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "foto" TEXT,
    "curso" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "situacaoMatricula" TEXT NOT NULL,
    "situacaoPagamento" TEXT NOT NULL,
    "totalParcelas" INTEGER NOT NULL,
    "parcelaAtual" INTEGER NOT NULL,
    "valorMensalidade" DOUBLE PRECISION NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "dataMatricula" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "totalHorasCurso" INTEGER NOT NULL,
    "horasRealizadas" INTEGER NOT NULL DEFAULT 0,
    "faltas" INTEGER NOT NULL DEFAULT 0,
    "percentualConclusao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ultimaSincronizacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoSheet" (
    "id" TEXT NOT NULL,
    "turno" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "nomeAba" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSheet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_cpf_key" ON "Aluno"("cpf");
