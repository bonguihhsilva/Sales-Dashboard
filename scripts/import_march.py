#!/usr/bin/env python3
"""
Script para importar dados de março 2026 direto no Supabase.
Uso: python3 scripts/import_march.py
Requer: pip install supabase
"""

import sys, json, re
from pathlib import Path
from datetime import date

try:
    from supabase import create_client
except ImportError:
    print("Instale: pip install supabase")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://zsczxblhtdhpdqvkpuwz.supabase.co"
# Coloque aqui sua SERVICE_ROLE_KEY (pegar em Supabase → Settings → API)
SERVICE_ROLE_KEY = input("Cole sua Supabase Service Role Key: ").strip()

PERIOD_ID = 1  # Março 2026

# Arquivos de vendas em ordem (sem sobreposição de datas)
HTML_FILES = [
    ("data/LISTADO_DE_VENTAS_completo.html",      None, 15),
    ("data/listado_para_dashboard_2.html",          16,  22),
    ("data/LISTADO_DE_VENTAS_23_a_26.html",         23,  25),
    ("data/LISTADO_DE_VENTAS_26_completo.html",     26,  26),
    ("data/LISTADO_DE_VENTAS_27_completo.html",     27,  None),
]

VENDOR_MAP = {
    '30':('Leticia','Jebai'),        '45':('Camila Celeste','Jebai'),
    '49':('Marly Gomez','Jebai'),    '44':('Fabiola Ledesma','Jebai'),
    '39':('Sara Gonzalez','Jebai'),  '58':('Luz Rosalba','Jebai'),
    '27':('Karen Talavera','Paje-Caixa'), '59':('Diana Aquino','Jebai'),
    '67':('Gessica Mendoza','Jebai'),'70':('Luana Aracely','Jebai'),
    '72':('Stefany Cantero','Jebai'),'69':('Carmen Gimenez','Jebai'),
    '65':('Micaela Gayoso','Jebai'), '71':('Alexandre Lugo','Jebai'),
    '68':('Pamela Ortiz','Jebai'),   '66':('Marilin Centurion','Jebai'),
    '35':('Tania Velazquez','Paje-MKT'),  '43':('Hassan Awala','Paje-MKT'),
    '42':('Gabriel Bolivar','Paje-MKT'),  '46':('Adrieli Pereira','Paje-MKT'),
    '19':('Fidal Hicham','Paje-MKT'),     '20':('Mohamed Gebai','Paje-MKT'),
    '40':('Juan Lezcano','Paje-MKT'),     '38':('Liz Zaracho','Paje-MKT'),
    '61':('Maria Vazquez','Paje-MKT'),    '64':('Laura Flores','Paje-MKT'),
    '62':('Raphael Rodriguez','Paje-MKT'),
    '4': ('Vitor Marchioro','Paje-Caixa'),'28':('Yazid Fattah','Paje-Caixa'),
    '31':('Dahiana Martinez','Paje-Caixa'),'51':('Evelin Brizuela','Paje-Caixa'),
    '34':('Rima Safa','Paje-Caixa'),      '33':('Ana Carolina','Paje-Caixa'),
}

def parse_html(html: str, day_from=None, day_to=None):
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.DOTALL)
    txs = []
    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        cells = [re.sub(r'<[^>]+>', '', c).replace('\xa0',' ').strip() for c in cells]
        if len(cells) < 19 or not re.match(r'^\d+$', cells[0]):
            continue
        try:
            day = int(cells[2].split('/')[0])
            if day_from and day < day_from: continue
            if day_to   and day > day_to:   continue
            valor = float(cells[15].replace(',',''))
            qty   = float(cells[9].replace(',','') or '0')
            if valor <= 0: continue
            # Convert DD/MM/YY → YYYY-MM-DD
            d, m, y = cells[2].split('/')
            sale_date = f"20{y}-{m.zfill(2)}-{d.zfill(2)}"
            txs.append({
                'vid': cells[18], 'cid': cells[0],
                'cname': cells[1].rstrip('/').strip(),
                'sale_date': sale_date, 'sale_time': cells[5] or None,
                'order_ref': cells[4], 'valor': valor, 'qty': qty,
            })
        except: pass
    return txs

def main():
    sb = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

    # Delete existing records for period
    print(f"Limpando registros existentes do período {PERIOD_ID}...")
    sb.table('sales_records').delete().eq('period_id', PERIOD_ID).execute()

    all_rows = []
    for (path, d_from, d_to) in HTML_FILES:
        p = Path(path)
        if not p.exists():
            print(f"  ⚠ Arquivo não encontrado: {path}")
            continue
        html = p.read_text(encoding='utf-8', errors='replace')
        txs = parse_html(html, d_from, d_to)
        print(f"  {p.name}: {len(txs)} transações")
        for tx in txs:
            if tx['vid'] not in VENDOR_MAP: continue
            name, store = VENDOR_MAP[tx['vid']]
            all_rows.append({
                'period_id':   PERIOD_ID,
                'vendor_id':   tx['vid'],
                'vendor_name': name,
                'store':       store,
                'client_id':   tx['cid'],
                'client_name': tx['cname'],
                'sale_date':   tx['sale_date'],
                'sale_time':   tx['sale_time'],
                'order_ref':   tx['order_ref'],
                'valor':       tx['valor'],
                'quantity':    tx['qty'],
            })

    print(f"\nTotal: {len(all_rows)} registros. Inserindo...")
    chunk = 500
    for i in range(0, len(all_rows), chunk):
        sb.table('sales_records').insert(all_rows[i:i+chunk]).execute()
        print(f"  {min(i+chunk, len(all_rows))} / {len(all_rows)}")

    print("\n✓ Importação concluída!")

if __name__ == '__main__':
    main()
