"""
Adiciona placeholders faltantes no contrato_template.docx:
- {nacionalidade} nas secoes legal e financeiro
- {enderecoResponsavel} na secao legal
- {bairroResponsavel} e {municipioResponsavel} na secao legal
"""
import zipfile, re, shutil, os, sys

template = 'lib/templates/contrato_template.docx'
backup  = 'lib/templates/contrato_template_pre_fix.docx'

shutil.copy(template, backup)
print(f'Backup criado: {backup}')

with zipfile.ZipFile(template, 'r') as z:
    xml = z.read('word/document.xml').decode('utf-8')
    all_files = {n: z.read(n) for n in z.namelist()}

original_xml = xml

def replace_in_para(xml, para_id, old_text, new_text):
    """Substitui old_text por new_text dentro do paragrafo identificado por para_id."""
    idx = xml.find(para_id)
    if idx == -1:
        print(f'  ERRO: paraId {para_id} nao encontrado')
        return xml
    end = xml.find('</w:p>', idx) + len('</w:p>')
    para_xml = xml[idx:end]
    if old_text not in para_xml:
        print(f'  AVISO: texto nao encontrado no para {para_id}: {repr(old_text[:60])}')
        return xml
    new_para = para_xml.replace(old_text, new_text, 1)
    return xml[:idx] + new_para + xml[end:]

# -----------------------------------------------------------------------
# 1. SECAO LEGAL - Nacionalidade (paraId 0BB01D74)
#    Texto atual: "Nacionalidade" [run] + ":                      " [run] + spaces [runs] + "    " + "Estado Civil:"
#    Queremos:  "Nacionalidade: {nacionalidade}    Estado Civil:"
# -----------------------------------------------------------------------
xml = replace_in_para(xml, '0BB01D74',
    '<w:t>Nacionalidade</w:t>',
    '<w:t xml:space="preserve">Nacionalidade: {nacionalidade}   </w:t>')

# Remove os runs de espacos que vinham depois de Nacionalidade (antes de Estado Civil)
# Os runs de espacos sao: ":                      ", "                                           ", "    "
# Precisamos remover esses 3 runs dentro do para 0BB01D74
idx = xml.find('0BB01D74')
end = xml.find('</w:p>', idx) + len('</w:p>')
para_xml = xml[idx:end]

# Remove runs que so tem espacos (entre Nacionalidade e Estado Civil)
# Padrao: <w:r>...<w:t...>  somente espacos  </w:t></w:r>
cleaned = re.sub(
    r'<w:r><w:rPr>.*?</w:rPr><w:t[^>]*>[ :]+</w:t></w:r>',
    '',
    para_xml,
    flags=re.DOTALL
)
xml = xml[:idx] + cleaned + xml[end:]
print('1. Nacionalidade legal: OK')

# -----------------------------------------------------------------------
# 2. SECAO LEGAL - Endereco (paraId 241CCED2)
#    Texto: "Endereço residencial" + ":                             "
#    Queremos: "Endereço residencial: {enderecoResponsavel}"
# -----------------------------------------------------------------------
xml = replace_in_para(xml, '241CCED2',
    ':                             ',
    ': {enderecoResponsavel}')
print('2. Endereco legal: OK')

# -----------------------------------------------------------------------
# 3. SECAO LEGAL - Bairro/Municipio (paraId 2B230AED)
#    Texto: "Bairro" + ":                     " + "Municipio:" + spaces + "Cep" + ": "
#    Queremos: "Bairro: {bairroResponsavel}   Municipio: {municipioResponsavel}   Cep: "
# -----------------------------------------------------------------------
xml = replace_in_para(xml, '2B230AED',
    ':                     ',
    ': {bairroResponsavel}   ')

idx = xml.find('2B230AED')
end = xml.find('</w:p>', idx) + len('</w:p>')
para_xml = xml[idx:end]

# Substituir o bloco de espacos apos Municipio: pelo placeholder
cleaned = re.sub(
    r'(<w:t>Munic\xedpio:</w:t></w:r>)(<w:r><w:rPr>.*?</w:rPr><w:t xml:space="preserve">)\s+</w:t>',
    r'\1\2 {municipioResponsavel}   </w:t>',
    para_xml,
    flags=re.DOTALL
)
if cleaned == para_xml:
    # Tenta sem acento (caso encoding diferente)
    cleaned = re.sub(
        r'(<w:t>Munic.pio:</w:t></w:r>)(<w:r><w:rPr>.*?</w:rPr><w:t xml:space="preserve">)\s+</w:t>',
        r'\1\2 {municipioResponsavel}   </w:t>',
        para_xml,
        flags=re.DOTALL
    )
xml = xml[:idx] + cleaned + xml[end:]
print('3. Bairro/Municipio legal: OK')

# -----------------------------------------------------------------------
# 4. SECAO FINANCEIRO - Nacionalidade (paraId 4147744A)
#    Texto: "Nacionalidade:" + "                                  " + "Estado Civil:" ...
#    Queremos: "Nacionalidade: {nacionalidade}   Estado Civil: ..."
# -----------------------------------------------------------------------
idx = xml.find('4147744A')
end = xml.find('</w:p>', idx) + len('</w:p>')
para_xml = xml[idx:end]

# Substituir run de espacos apos "Nacionalidade:"
cleaned = re.sub(
    r'(<w:t[^>]*>Nacionalidade:</w:t></w:r>)(<w:r><w:rPr>.*?</w:rPr><w:t[^>]*>)\s+</w:t>',
    r'\1\2 {nacionalidade}   </w:t>',
    para_xml,
    flags=re.DOTALL
)
xml = xml[:idx] + cleaned + xml[end:]
print('4. Nacionalidade financeiro: OK')

# -----------------------------------------------------------------------
# Verificacoes finais
# -----------------------------------------------------------------------
count_nac = xml.count('{nacionalidade}')
count_end = xml.count('{enderecoResponsavel}')
count_bai = xml.count('{bairroResponsavel}')
count_mun = xml.count('{municipioResponsavel}')
print(f'\nPlaceholders no XML final:')
print(f'  {{nacionalidade}}:        {count_nac}x (esperado 2)')
print(f'  {{enderecoResponsavel}}:  {count_end}x (esperado 2)')
print(f'  {{bairroResponsavel}}:    {count_bai}x (esperado 2)')
print(f'  {{municipioResponsavel}}: {count_mun}x (esperado 2)')

# -----------------------------------------------------------------------
# Salva o docx modificado
# -----------------------------------------------------------------------
import io
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

print(f'\nTemplate salvo: {template}')
