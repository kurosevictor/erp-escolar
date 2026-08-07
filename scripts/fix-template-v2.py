"""
Edita o template docx fazendo substituicoes diretas e precisas no XML.
Abordagem: substitui texto dentro de cada run especifico usando paraId como ancora.
"""
import zipfile, re, shutil, io

template = 'lib/templates/contrato_template.docx'
backup  = 'lib/templates/contrato_template_pre_fix.docx'

with zipfile.ZipFile(template, 'r') as z:
    xml = z.read('word/document.xml').decode('utf-8')

def find_para(xml, para_id):
    """Retorna (inicio_do_wP_tag, fim_do_wP) para o paragrafo com esse paraId."""
    idx_id = xml.find(para_id)
    if idx_id == -1:
        return None, None
    # Volta para encontrar o inicio do <w:p
    start = xml.rfind('<w:p ', 0, idx_id)
    end = xml.find('</w:p>', idx_id) + len('</w:p>')
    return start, end

def replace_text_in_para(xml, para_id, old_t, new_t):
    """Substitui old_t por new_t dentro do paragrafo identificado por para_id."""
    s, e = find_para(xml, para_id)
    if s is None:
        print(f'  ERRO: para {para_id} nao encontrado')
        return xml
    para = xml[s:e]
    if old_t not in para:
        print(f'  AVISO: texto nao encontrado: {repr(old_t[:50])}')
        return xml
    new_para = para.replace(old_t, new_t, 1)
    return xml[:s] + new_para + xml[e:]

# -----------------------------------------------------------------------
# Para [18] paraId=0BB01D74 — Linha Nacionalidade secao LEGAL
# Texto atual: "Nacionalidade" + ":                      " + spaces + spaces + "Estado Civil:"
# Estrategia: substituir somente o run ":                      " por ": {nacionalidade}   "
#             e zerar os dois runs de espacos pure
# -----------------------------------------------------------------------

# Substituir ": " com espacos pelo placeholder (run apos Nacionalidade)
xml = replace_text_in_para(xml, '0BB01D74',
    ':                      ',
    ': {nacionalidade}   ')

# Remover os dois runs de espacos puros dentro do para 18 (que ficam entre {nacionalidade} e Estado Civil)
s, e = find_para(xml, '0BB01D74')
para = xml[s:e]
# Os runs de espacos tem formato: <w:r><w:rPr>...</w:rPr><w:t xml:space="preserve">   SOMENTE ESPACOS  </w:t></w:r>
# Como sao muitos espacos, identificamos pelo comprimento (>10 espacos)
para = re.sub(
    r'<w:r><w:rPr><w:rFonts[^/]*/><w:sz[^/]*/><w:szCs[^/]*/></w:rPr><w:t xml:space="preserve"> {10,}</w:t></w:r>',
    '',
    para
)
para = re.sub(
    r'<w:r><w:rPr><w:rFonts[^/]*/><w:sz[^/]*/><w:szCs[^/]*/></w:rPr><w:t xml:space="preserve"> {3,}</w:t></w:r>',
    '',
    para
)
xml = xml[:s] + para + xml[e:]
print('1. Nacionalidade legal: substituido')

# -----------------------------------------------------------------------
# Para [19] paraId=241CCED2 — Linha Endereco secao LEGAL
# Texto: "Endereço residencial" + ":                             "
# -----------------------------------------------------------------------
xml = replace_text_in_para(xml, '241CCED2',
    ':                             ',
    ': {enderecoResponsavel}')
print('2. Endereco legal: substituido')

# -----------------------------------------------------------------------
# Para [20] paraId=2B230AED — Linha Bairro/Municipio secao LEGAL
# Texto: "Bairro" + ":                     " + "Municipio:" + spaces + "Cep" + ": "
# -----------------------------------------------------------------------
xml = replace_text_in_para(xml, '2B230AED',
    ':                     ',
    ': {bairroResponsavel}   ')

# Substituir o bloco de espacos apos Municipio
s, e = find_para(xml, '2B230AED')
para = xml[s:e]
# Encontrar o padrao: "Municipio:" seguido de run de espacos
para = re.sub(
    r'(<w:t>Munic.pio:</w:t></w:r>)(<w:r>(<w:rPr>.*?</w:rPr>)<w:t xml:space="preserve">) {10,}(</w:t></w:r>)',
    r'\1\2 {municipioResponsavel}   \4',
    para,
    flags=re.DOTALL
)
xml = xml[:s] + para + xml[e:]
print('3. Bairro/Municipio legal: substituido')

# -----------------------------------------------------------------------
# Para [28] paraId=4147744A — Linha Nacionalidade secao FINANCEIRO
# Texto: "Nacionalidade:" + "                                  " + "Estado Civil:"...
# -----------------------------------------------------------------------
s, e = find_para(xml, '4147744A')
para = xml[s:e]
# Substituir run de espacos apos "Nacionalidade:"
para = re.sub(
    r'(<w:t[^>]*>Nacionalidade:</w:t></w:r>)(<w:r><w:rPr>.*?</w:rPr><w:t xml:space="preserve">) {5,}(</w:t></w:r>)',
    r'\1\2 {nacionalidade}   \3',
    para,
    flags=re.DOTALL
)
xml = xml[:s] + para + xml[e:]
print('4. Nacionalidade financeiro: substituido')

# -----------------------------------------------------------------------
# Verificacoes
# -----------------------------------------------------------------------
print(f'\nPlaceholders finais:')
print(f'  nacionalidade:        {xml.count("{nacionalidade}")}x  (esperado 2)')
print(f'  enderecoResponsavel:  {xml.count("{enderecoResponsavel}")}x  (esperado 2)')
print(f'  bairroResponsavel:    {xml.count("{bairroResponsavel}")}x  (esperado 2)')
print(f'  municipioResponsavel: {xml.count("{municipioResponsavel}")}x  (esperado 2)')

# Mostrar resultado dos paras editados
all_paras = re.findall(r'<w:p[ >].*?</w:p>', xml, re.DOTALL)
print('\nConteudo apos edicao:')
for i in [18, 19, 20, 28]:
    texts = re.findall(r'<w:t[^>]*>([^<]+)</w:t>', all_paras[i])
    print(f'  [{i}] {"||".join(texts)[:150]}')

# -----------------------------------------------------------------------
# Salvar
# -----------------------------------------------------------------------
buf = io.BytesIO()
with zipfile.ZipFile(template, 'r') as zin:
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zout:
        for name in zin.namelist():
            if name == 'word/document.xml':
                zout.writestr(name, xml.encode('utf-8'))
            else:
                zout.writestr(name, zin.read(name))

with open(template, 'wb') as f:
    f.write(buf.getvalue())

print(f'\nTemplate salvo com sucesso.')
