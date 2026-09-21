# TattvaTech project numbering

## Purpose

Project codes communicate a project's product family and stable position within that family. They are human identifiers for conversation, dashboards, documents, and activity messages—not database keys and not amounts.

```text
1     WhatsApp Bot
1.1   School WhatsApp Bot
1.2   Hotel WhatsApp Bot

2     ERP
2.1   School ERP
2.2   College ERP
```

## Storage rules

`Project.id` is the normal UUID primary key. `Project.projectCode` is a unique string. The code must never use `FLOAT`, `DOUBLE`, or `DECIMAL`: numeric storage would make identifiers such as `2.10` vulnerable to being treated like `2.1`.

```text
Database ID: 847 (internal identity)
Project code: "2.1" (human identity)
Project name: School ERP
```

The quotes around `2.1` are intentional. `2.10` is a distinct string and must remain distinct from `2.1`.

## Families and generation

Families are database records in `project_families`, with unique string `code` and name. The initial seed contains:

| Code | Family |
| --- | --- |
| 1 | WhatsApp Bot |
| 2 | ERP |
| 3 | Website |
| 4 | AI Solutions |
| 5 | Automation |
| 6 | Internal Systems |

When a project is created, the server loads the selected family, finds existing codes in that family, and allocates the next suffix. The UI may display a preview but cannot choose an arbitrary final code. Creation runs in a serializable database transaction and the unique constraint on `project_code` is the final duplicate guard. A retry is appropriate if a concurrent transaction wins the allocation race.

Examples:

```text
First ERP project       → "2.1"
Second ERP project      → "2.2"
After "2.9"             → "2.10"
First WhatsApp project  → "1.1"
```

Codes are not reused after archive or deletion. Historical activity, documents, and conversations should continue to point at the same human code.

## Product versus deployment

An internal product is not the same as a client's deployment of that product.

```text
2.1      School ERP                 (core product)
2.1-D001 Ryan International School  (client deployment)
2.1-D002 ABC School Deployment      (client deployment)
```

The current foundation stores project type (`INTERNAL_PRODUCT`, `CLIENT_PROJECT`, `INTERNAL_TOOL`, or `R_AND_D`) and keeps the family/code boundary ready for a future deployment model. A deployment must not consume a new product-family suffix merely because it belongs to a different client.

## Integrity

`project_families.code` and `projects.project_code` are unique. Project family and membership references use foreign keys. Archive preserves project, task, membership, and activity history; it does not recycle a code.
