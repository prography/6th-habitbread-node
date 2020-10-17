# IT 동아리 프로그라피 6기 프로젝트

## 서비스 소개

> 꾸준한 습관 관리 및 동기 부여 제공을 위해 '습관빵을 굽는 제빵사'를 모토로 브랜딩화 한 서비스

'습관빵'은 좋은 습관을 만들고 싶은 사용자들에게 도움을 주는 모바일 앱 서비스입니다.

다양한 빵을 만드는 '제빵사'처럼 여러분의 다양한 습관을 구워 좋은 습관을 완성할 수 있도록 도와줄 겁니다.

습관을 기록하고 한 눈에 알아 볼 수 있는 통계와 랭킹, 푸시 알림을 통한 리마인더 기능을 제공 받아보세요 !

## 서비스 결과물

![프로젝트 결과물](https://user-images.githubusercontent.com/28949165/96334300-a85bb800-10aa-11eb-9650-f0a7bffc020e.png)

## 프로젝트 구조

- 추가 예정..!

## DB 스키마 구조도

![습관빵 DB구조](https://user-images.githubusercontent.com/28949165/96334295-a42f9a80-10aa-11eb-8d9a-5aec16e48331.png)

## Redis 구성

### Ranking

- `Dense Ranking` 구현을 위한 구조

1. Sorted Sets

   ```
   [Key]
   "user:score"

   [Value]
   [
       {
           "value" : "user:1",
           "score" : "50"
       },
       ...
   ]
   ```

2. Hash

   ```
   [Key]
   "user:{id}" 
   Ex) "user:1", "user:2"

   [Value]
   [
       {
           "name" : "사용자 이름",
           "achievement" : "50",
           "exp" : "10"
       },
           ...
   ]
   ```

### Scheduler

- FCM 메시징 기능 구현을 위한 구조

1. Set

   ```
   [Key]
   "MMDDHHmm" Date 형태의 String 
   Ex) "10281020"

   [Value]
   [
       {"10"}, // 습관의 ID
       {"80"}
       ...
   ]
   ```

2. Hash - 1

   ```
   [Key]
   "habit:{id}"
   Ex) "habit:1", "habit:2"

   [Value]
   [
      {
          "userId" : "1",
          "title" : "매일 하루 1번 물 마시기",
          "dayOfWeek" : "0100010" // 습관을 해야할 요일
      },
          ...
   ]
   ```

3. Hash - 2

   ```
   [Key]
   "user:{id}"
   Ex) "user:1", "user:2"

   [Value]
   [
       {
           "isAlarmOn" : "0", // 0 or 1 (알람 킨 여부)
           "FCMToken" : "token", // FCM에서 발급받은 토큰
       },
           ...
   ]
   ```

## 기술 스택

- RunTime : `Node.js`

- Web server : `Nginx + SSL 인증`

- Framework : `Express`

- Language : `Typescript`

- Dependencies Management : `NPM`

- Security : `Let's Encrypt + JWT`

- Database : `MySQL`

- ORM : `Prisma2`

- Testing : `Jest + supertest`

- Interactive Build : `Docker`

- Cloud Server : `AWS EC2`

- CI / CD : `Github Action`

- OAuth : `Google`, `Apple`

- Cloud Messaging : `FCM (Firebase Cloud Messaging)`

## API 문서

[HabitBread API 문서](https://www.notion.so/dnatuna/aed8463a7c0f49c3a6ecaaf4b6829c2b?v=185049ab1dd54c87b4a80c178dd5875d)

## 문의

서비스 사용 중 문제가 발생하면 `issue`를 달아주세요 🙇🏻‍♂️
