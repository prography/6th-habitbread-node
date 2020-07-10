# Migration `20200710144635-open-beta`

This migration has been generated at 7/10/2020, 2:46:36 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP TABLE `habit_bread`.`ranking`;
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200628024522-2020-06-28-close-beta..20200710144635-open-beta
--- datamodel.dml
+++ datamodel.dml
@@ -1,27 +1,18 @@
 generator client {
   provider = "prisma-client-js"
+  binaryTargets = ["native", "debian-openssl-1.1.x"]
 }
 datasource mysql {
   provider = "mysql"
-  url = "***"
+  url      = env("DB_URL")
 }
-model Ranking {
-  userId        Int       @id @map("user_id")
-  userName      String    @map("user_name")
-  exp           Int
-  achievement   Int
-
-  @@map("ranking")
-}
-
 model Scheduler {
   scheduleId     Int       @default(autoincrement()) @id @map("schedule_id")
   userId         Int       @map("user_id")
   habitId        Int       @map("habit_id") @unique
-
   @@map("scheduler")
 }
 model Habit {
@@ -32,22 +23,18 @@
   description     String?
   dayOfWeek       String    @map("day_of_week")
   alarmTime       String?   @map("alaram_time")
   continuousCount Int       @map("countinuous_count") @default(0)
-
   commitHistory   CommitHistory[]
   user            User      @relation(fields: [userId], references: [userId])
-
   @@index([userId], name: "fk_Habit_User1_idx")
   @@map("habits")
 }
 model CommitHistory {
   createdAt     DateTime  @default(now()) @map("created_at") @id
   habitId       Int       @map("habit_id")
-
   habits        Habit     @relation(fields: [habitId], references: [habitId])
-
   @@index([habitId], name: "fk_Habit_History_Habit1_idx")
   @@map("commit_history")
 }
@@ -58,24 +45,20 @@
   createdAt     DateTime? @map("created_at") @default(now())
   updatedAt     DateTime? @map("updated_at") @updatedAt
   oauthKey      String    @map("oauth_key") @unique
   fcmToken      String?
-
   items         UserItem[]
   habits        Habit[]
-
   @@map("users")
 }
 model UserItem {
   userItemId  Int       @default(autoincrement()) @id @map("user_item_id")
   itemId      Int       @map("item_id")
   userId      Int       @map("user_id")
   createdAt   DateTime  @default(now())
-
   item        Item      @relation(fields: [itemId], references: [itemId])
   user        User      @relation(fields: [userId], references: [userId])
-
   @@unique([itemId, userId])
   @@map("user_item")
 }
```


