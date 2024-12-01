# Database

## lokální MSSQL
server  LANGR\LANGR2016
databáze aistaging

Pozor. Na počítači musí být spuštěna služba SQL Server Browser jinak se nepřipojí.

## databáze MSSQL na Azure
 název serveru aistaging.database.windows.net
 databáze  aistaging
 user   aistaging_admin
 heslo  Bigmuzzy125   
 
 connection strings
 
 Server=tcp:aistaging.database.windows.net,1433;Initial Catalog=aistaging;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Authentication="Active Directory Default";
            
 Server=tcp:aistaging.database.windows.net,1433;Initial Catalog=aistaging;Persist Security Info=False;User ID=aistaging_admin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;

## databáze Postgres na Render.com
### externí přístup
použije se rychlejší pro přístup k databázi pomocí DBeaver nebo z lokální instalace backendu
! musí mít nastaveno ssl = true, jinak se nepřipojí 

username: "db_user",
password: "0bL7rEVIwA0u62kccWlG3mOmtaBeAWIq",
database: "aistaging",
host: "dpg-cscj0jo8fa8c7382gm7g-a.frankfurt-postgres.render.com",
port: 5432,

### interní přístup
použije se rychlejší pro private přístup z backendu do databáze
! nesmí mít nastaveno ssl = true, jinak se nepřipojí s chybou self-signed-certificate

username: "db_user",
password: "0bL7rEVIwA0u62kccWlG3mOmtaBeAWIq",
database: "aistaging",
host: "dpg-cscj0jo8fa8c7382gm7g-a",
port: 5432,
 
## Vytvoření prázdných tabulek v databázi
Vytvoření prázdných tabulek v databázi podle definovaných modelů provedeme jednorázově pomocí scriptu create_db.js

voláme
node create_db.js

respektuje konfiguraci databáze v .env

## Synchronizece modelu s tabulkami v databázi (alter, bez ztráty dat)

úpravu databáze podle modelu provedeme 
node alter_db.js

## Migrace
Migrace dat v databázi se provádí pomocí umzug.
https://github.com/sequelize/umzug

Pořadí migrací je určováno abecedně podle názvů souborů. Proto se často používá konvence pojmenování souborů migrací s časovými značkami (timestamps) nebo číselnou sekvencí na začátku názvu souboru.

Standardní způsob je začít názvy souborů migrací pomocí časových razítek (timestamp) nebo čísel:

    20230924120000-create-users.js
    20230924130000-add-email-column.js
    20230924140000-remove-old-column.js

Migrace jsou umístěny ve složce migrations.
V databází se ukládá záznam o migraci v tabulce sequelizemeta.

Spuštění migrace se provede pomocí scriptu migrator.js  který funguje jako cli.
Migrator používá napojení na databázi a modely přímo z projektu backendu.

node migrator pending --help # show help/options
node migrator executed --help # show help/options

node migrator create --name my-migration.js   # vytvoření migračního souboru s názvem <timestamp>my-migration.js podle template

node migrator pending # list migrations yet to be run
node migrator executed # list migrations that have already run

node migrator pending --json # list pending migrations including names and paths, in a json array format
node migrator executed --json # list executed migrations including names and paths, in a json array format

node migrator up  # vykoná pending migrace

usage: <script> up [-h] [--to NAME] [--step COUNT] [--name MIGRATION]
                   [--rerun {THROW,SKIP,ALLOW}]                 

Performs all migrations. See --help for more options

Optional arguments:
  -h, --help            Show this help message and exit.
  --to NAME             All migrations up to and including this one should be 
                        applied
  --step COUNT          Apply this many migrations. If not specified, all 
                        will be applied.
  --name MIGRATION      Explicity declare migration name(s) to be applied. 
                        Only these migrations will be applied.
  --rerun {THROW,SKIP,ALLOW}
                        Specify what action should be taken when a migration 
                        that has already been applied is passed to --name. 
                        The default value is "THROW".

node migrator down  # revertuje poslední vykonanou migraci

usage: <script> down [-h] [--to NAME] [--step COUNT] [--name MIGRATION]
                     [--rerun {THROW,SKIP,ALLOW}]
                     

Undoes previously-applied migrations. By default, undoes the most recent 
migration only. Use --help for more options. Useful in development to start 
from a clean slate. Use with care in production!

Optional arguments:
  -h, --help            Show this help message and exit.
  --to NAME             All migrations up to and including this one should be 
                        reverted. Pass '0' to revert all.
  --step COUNT          Revert this many migrations. If not specified, only 
                        the most recent migration will be reverted.
  --name MIGRATION      Explicity declare migration name(s) to be reverted. 
                        Only these migrations will be reverted.
  --rerun {THROW,SKIP,ALLOW}
                        Specify what action should be taken when a migration 
                        that has already been applied is passed to --name. 
                        The default value is "THROW".

## Přesun data z původního systému - seed

Načteme v původní databáze (pomocí PHP Admin) tabulku st_subscriber. Uložíme jak json array.
Vzorek dat 

[
{
    "id": "2",
    "user_id": "29",
    "user_email": "SSS@test.cz",
    "start_date": "2024-01-04",
    "end_date": "2024-02-03",
    "last_run": "2024-01-04 16:53:33",
    "last_render_id": null,
    "last_render_status": null,
    "total_count": "2",
    "max_count": "10",
    "disabled": "0"
},
{
    "id": "554",
    "user_id": "865",
    "user_email": "bianka.dzurisova@gmail.com",
    "start_date": "2024-10-08",
    "end_date": "2024-11-07",
    "last_run": "2024-10-08 20:38:12",
    "last_render_id": "GeMVxBHobYIkG7kM8L9U",
    "last_render_status": "done",
    "total_count": "2",
    "max_count": "10",
    "disabled": "0"
}
]

Použije umzug obdobně jako pro migraci.
Spuštění seedu se provede pomocí scriptu seeder.js  který funguje jako cli.
Seedy  jsou uloženy ve složce seeds.
V databází se ukládá záznam o migraci v tabulce sequelizedata.

seed 2024.10.09T17.22.19.old_data.js obsahuje import dat původního systému.

node seeder up  # vykoná pending seed

Provede uložení dat na základě emailu. Uživatel dostane jméno podle emailu, heslo je jako výchozí hodnota nastaven také email.


