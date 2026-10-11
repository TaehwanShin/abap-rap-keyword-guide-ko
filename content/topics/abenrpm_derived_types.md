---
title: BDEF derived type
summary: CDS entity 와 behavior definition 에서 자동으로 만들어지는 RAP 전용 데이터 타입으로, RAP BO consumer 와 provider 가 데이터를 주고받을 때 씁니다.
keywords: BDEF derived type, BDEF 파생 타입, TYPE TABLE FOR, TYPE STRUCTURE FOR, TYPE REQUEST FOR, TYPE RESPONSE FOR, %key, % 구성요소, 구성요소 묶음, 입력 타입, 결과 타입
---

## 설명

BDEF derived type(BDEF 파생 타입)은 RAP 에서만 쓰는 특별한 데이터 타입입니다. ABAP 런타임 프레임워크가 CDS entity(엔터티)와 그 behavior definition(동작 정의, BDEF)를 보고 자동으로 만들어 냅니다. ABAP 에서는 이 타입 덕분에 RAP BO 에 타입이 맞는지 확인받으며 안전하게 접근할 수 있습니다.

RAP BO consumer(사용자)와 RAP BO provider(제공자)는 BDEF derived type 으로 선언한 내부 테이블과 구조로 데이터를 주고받습니다. 내부 테이블로 주고받으므로 여러 건을 한 번에 처리할 수 있습니다.

### 입력용과 결과용

BDEF derived type 은 RAP BO provider 메서드에서 받는 쪽 매개변수로 쓰이느냐, 내보내는 쪽 매개변수로 쓰이느냐에 따라 둘로 나뉩니다.

- 입력용 : `... FOR CREATE ...`, `... FOR UPDATE ...` 등
- 결과용 : `... FOR READ RESULT ...`, `... FOR ACTION RESULT ...`, `... FOR FAILED ...` 등

### 들어 있는 구성요소

BDEF derived type 으로 선언한 내부 테이블과 구조에는 두 가지 구성요소가 들어 있습니다.

- **CDS entity 의 구성요소** : 키 필드와 데이터 필드입니다. 원래 데이터 타입을 그대로 지닙니다.
- **RAP 구성요소** : entity 에서 타입을 물려받지 않고, 트랜잭션 처리에 필요한 정보를 담도록 따로 만든 타입을 지닙니다. 이름이 `%` 로 시작해서 entity 의 필드 이름과 겹치지 않습니다.

RAP 구성요소 가운데에는 **구성요소 묶음**도 있습니다. 테이블 열 여러 개를 이름 하나로 묶어서 다루기 쉽게 한 것입니다. 예를 들어 `%key` 는 기본 키 필드를 모두 묶은 것입니다. 구성요소 하나하나는 [[abapderived_types_comp]] 에서 설명합니다.

### 쓰는 곳

RAP BO 작업의 매개변수는 대부분 BDEF derived type 입니다. 그 밖에 EML 을 쓰는 ABAP 프로그램에서도 `TYPES`, `DATA`, `CREATE` 문으로 변수를 [[abapderived_types_declaration|직접 선언]]해 쓸 수 있습니다. 선언 방식은 네 가지입니다.

- [[abaptype_table_for]] : 내부 테이블 타입
- [[abaptype_structure_for]] : 구조 타입
- [[abaptype_request_for]] : 요청 타입
- [[abaptype_response_for]] : 응답 타입

## 예제

여행을 만들 때 넘길 입력 테이블과, 실패 정보를 받을 응답 구조를 선언합니다.

```abap
" 입력용: 생성할 여행을 담는 내부 테이블
DATA lt_create TYPE TABLE FOR CREATE zr_travel.

" 결과용: 실패한 인스턴스 정보를 받는 응답 구조
DATA ls_failed TYPE RESPONSE FOR FAILED zr_travel.

lt_create = VALUE #( ( %cid       = 'cid1'           " RAP 구성요소
                       travelid   = '00000001'       " entity 의 키 필드
                       agencyid   = '070001'         " entity 의 데이터 필드
                       customerid = '000010' ) ).

MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid ) WITH lt_create
  FAILED ls_failed.
```

## 알아두기

- BDEF derived type 은 자동으로 만들어지며 ABAP 컴파일러만 알고 있습니다. 어떤 구성요소가 들어 있는지 보려면 ADT 에서 그 타입으로 선언한 변수에 커서를 두고 F2 를 눌러 요소 정보를 엽니다.

## 하위 항목

- [[abapderived_types_declaration]] : BDEF derived type 으로 변수와 타입을 선언하는 방법입니다.
- [[abapderived_types_dynamic]] : 실행 중에 BDEF derived type 을 만들어 쓰는 방법입니다.
- [[abapderived_types_comp]] : `%` 로 시작하는 구성요소와 구성요소 묶음을 설명합니다.

## 관련 항목

- [[abaptype_table_for]]
- [[abaptype_structure_for]]
- [[abaptype_request_for]]
- [[abaptype_response_for]]
