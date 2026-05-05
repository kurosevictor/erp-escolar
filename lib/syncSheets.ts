// Google Sheets sync — pendente de redesign para novo schema (Turma/Presenca)
// Os campos horasRealizadas, faltas, totalHorasCurso foram removidos do modelo Aluno.
export async function syncAllSheets() {
  return {
    atualizados: 0,
    naoEncontrados: [] as string[],
    erros: ['Sincronização com Google Sheets não implementada para o novo schema.'],
  }
}
