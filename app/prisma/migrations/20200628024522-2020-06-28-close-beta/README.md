# Migration `20200628024522-2020-06-28-close-beta`

This migration has been generated by dnatuna at 6/28/2020, 2:45:22 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE `habit_bread`.`items` DROP COLUMN `img`;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200627201036-2020-06-27-close-beta..20200628024522-2020-06-28-close-beta
--- datamodel.dml
+++ datamodel.dml
@@ -3,9 +3,9 @@
 }
 datasource mysql {
   provider = "mysql"
-  url = "***"
+  url      = env("DB_URL")
 }
 model Ranking {
   userId        Int       @id @map("user_id")
@@ -83,8 +83,7 @@
   itemId        Int       @default(autoincrement()) @id @map("item_id")
   name          String
   description   String
   level         Int
-  img           String
   @@map("items")
 }
```


