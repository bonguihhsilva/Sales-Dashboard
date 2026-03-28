#!/usr/bin/env python3
"""
Cria todos os usuários vendedores no Supabase Auth.
Senha padrão inicial: DaSilva@2026 (vendedor deve trocar no primeiro acesso)

Uso: python3 scripts/create_users.py
Requer: pip install requests
"""

import requests, json, time

SUPABASE_URL      = "https://zsczxblhtdhpdqvkpuwz.supabase.co"
SERVICE_ROLE_KEY  = "sb_secret_R6E6CjqKcIB3b3U_PfO3iA_Opeu7tNY"
DEFAULT_PASSWORD  = "DaSilva@2026"

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

# Lista de vendedores: (vendor_id, nome, email, role)
# Edite os emails conforme necessário
USERS = [
    # ADM — edite o email aqui
    (None,  "Administrador",              "admin@dasilva.com",              "adm"),
    # Jebai
    ("30",  "Leticia",                    "leticia@dasilva.com",            "vendedor"),
    ("45",  "Camila Celeste",             "camila.celeste@dasilva.com",     "vendedor"),
    ("49",  "Marly Gomez",                "marly@dasilva.com",              "vendedor"),
    ("44",  "Fabiola Ledesma",            "fabiola@dasilva.com",            "vendedor"),
    ("39",  "Sara Gonzalez",              "sara@dasilva.com",               "vendedor"),
    ("58",  "Luz Rosalba",                "luzrosalba@dasilva.com",         "vendedor"),
    ("27",  "Karen Talavera",             "karen.talavera@dasilva.com",     "vendedor"),
    ("59",  "Diana Aquino",               "diana@dasilva.com",              "vendedor"),
    ("67",  "Gessica Mendoza",            "gessica@dasilva.com",            "vendedor"),
    ("70",  "Luana Aracely",              "luana@dasilva.com",              "vendedor"),
    ("72",  "Stefany Cantero",            "stefany@dasilva.com",            "vendedor"),
    ("69",  "Carmen Gimenez",             "carmen@dasilva.com",             "vendedor"),
    ("65",  "Micaela Gayoso",             "micaela@dasilva.com",            "vendedor"),
    ("71",  "Alexandre Lugo",             "alexandre@dasilva.com",          "vendedor"),
    ("68",  "Pamela Ortiz",               "pamela@dasilva.com",             "vendedor"),
    ("66",  "Marilin Centurion",          "marilin@dasilva.com",            "vendedor"),
    # Paje-MKT
    ("35",  "Tania Velazquez",            "tania@dasilva.com",              "vendedor"),
    ("43",  "Hassan Awala",               "hassan@dasilva.com",             "vendedor"),
    ("42",  "Gabriel Bolivar",            "gabriel@dasilva.com",            "vendedor"),
    ("46",  "Adrieli Pereira",            "adrieli@dasilva.com",            "vendedor"),
    ("19",  "Fidal Hicham",               "fidal@dasilva.com",              "vendedor"),
    ("20",  "Mohamed Gebai",              "mohamed.gebai@dasilva.com",      "vendedor"),
    ("40",  "Juan Lezcano",               "juan@dasilva.com",               "vendedor"),
    ("38",  "Liz Zaracho",                "liz@dasilva.com",                "vendedor"),
    ("61",  "Maria Vazquez",              "maria.vazquez@dasilva.com",      "vendedor"),
    ("64",  "Laura Flores",               "laura@dasilva.com",              "vendedor"),
    ("62",  "Raphael Rodriguez",          "raphael@dasilva.com",            "vendedor"),
    # Paje-Caixa
    ("4",   "Vitor Marchioro",            "vitor@dasilva.com",              "vendedor"),
    ("28",  "Yazid Fattah",               "yazid@dasilva.com",              "vendedor"),
    ("31",  "Dahiana Martinez",           "dahiana@dasilva.com",            "vendedor"),
    ("51",  "Evelin Brizuela",            "evelin@dasilva.com",             "vendedor"),
    ("34",  "Rima Safa",                  "rima@dasilva.com",               "vendedor"),
    ("33",  "Ana Carolina",               "ana.carolina@dasilva.com",       "vendedor"),
]

def create_user(vendor_id, name, email, role):
    # 1. Create auth user
    res = requests.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers=HEADERS,
        json={
            "email": email,
            "password": DEFAULT_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"name": name},
        }
    )
    if res.status_code not in (200, 201):
        print(f"  ✗ {name}: {res.text}")
        return None

    user_id = res.json()["id"]

    # 2. Update profile
    res2 = requests.patch(
        f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}",
        headers=HEADERS,
        json={"name": name, "role": role, "vendor_id": vendor_id},
    )
    if res2.status_code not in (200, 204):
        print(f"  ✗ Profile update {name}: {res2.text}")
    else:
        print(f"  ✓ {name} ({role}) — {email}")

    return user_id

def main():
    print(f"Criando {len(USERS)} usuários no Supabase...\n")
    created = 0
    for (vendor_id, name, email, role) in USERS:
        uid = create_user(vendor_id, name, email, role)
        if uid:
            created += 1
        time.sleep(0.3)  # rate limit

    print(f"\n✓ {created}/{len(USERS)} usuários criados.")
    print(f"Senha inicial de todos: {DEFAULT_PASSWORD}")
    print("Recomende que cada vendedor troque a senha no primeiro acesso.")

if __name__ == "__main__":
    main()
