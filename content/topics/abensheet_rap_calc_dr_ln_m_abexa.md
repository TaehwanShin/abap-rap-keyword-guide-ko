---
title: 예제 - RAP 계산기, draft 와 late numbering 을 쓰는 managed RAP BO
summary: 피연산자 둘과 연산자를 넣으면 결과를 계산해 주는 RAP BO 로, draft 를 만들고 활성화하고 잘못된 값을 고쳐 다시 저장하는 흐름과 late numbering 을 보여 주는 예제입니다.
keywords: RAP calculator, RAP 계산기, managed, 관리형, with draft, draft, 초안, late numbering, 늦은 번호 부여, %is_draft, %pid, %pky, Activate, draft action, 초안 액션, AUTO FILL CID, internal action, determination on modify, validation on save, total etag, Fiori Elements preview, 예제
---

## 설명

RAP 로 만든 계산기입니다. 인스턴스 하나가 계산 하나입니다. 계산 ID(키), 정수 피연산자 둘, 산술 연산자, 결과, 그리고 draft 에 필요한 날짜·시간 필드로 이루어집니다. managed 이고 draft 를 쓰며 **late numbering**를 합니다. 그래서 키인 계산 ID 는 save sequence(저장 순서)에 들어가서야 정해집니다.

behavior definition(동작 정의)의 뼈대는 이렇습니다.

- `with draft`, `draft table`, `total etag`, `etag master`, `late numbering`
- 키, 결과, 날짜·시간 필드는 readonly 이고 피연산자와 연산자는 필수입니다.
- 피연산자나 연산자가 바뀌면 도는 수정 시점 determination 이 하나, internal action 이 하나 있습니다.
- 저장 시점 validation 이 입력을 확인합니다. 이 validation 은 draft determine action `Prepare` 에도 들어 있습니다.
- 저장된 계산을 모두 지우는 static action 이 하나 있습니다.
- draft action `Resume`, `Edit`, `Activate optimized`, `Discard`

실행 클래스는 RAP BO consumer(사용자) 역할로 세 단계를 밟습니다. 단계마다 draft 테이블과 persistent table 을 읽어 활성화 전과 후를 나란히 출력합니다.

1. **인스턴스를 만들어 저장하기** : 연산자가 서로 다른 계산 다섯 개를 draft 로 만듭니다. 모두 올바른 결과가 나옵니다. 이때는 draft 테이블에만 있고 persistent table 에는 없습니다. `Activate` action 을 실행하면 persistent table 로 옮겨지고 draft 테이블은 비워집니다.
2. **잘못된 인스턴스 만들기** : 틀린 연산자, 0 으로 나누기, 산술 넘침을 일으키는 계산 세 개를 만듭니다. 모두 실패해서 `failed` 와 `reported` 응답에 담깁니다. `Activate` 를 실행해도 persistent table 에 들어가지 않습니다.
3. **잘못된 인스턴스 고치기** : 그 draft 세 개를 읽어 값을 바로잡고 다시 `Activate` 합니다. 이제 persistent table 에 저장됩니다.

## 예제

같은 구조를 여행 모델로 옮기면 이렇습니다. 예약 수수료(`BookingFee`)가 바뀌면 도는 수정 시점 determination 과 internal action 을 두어 `TotalPrice` 를 계산하는 구성입니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );
with draft;

define behavior for ZR_Travel alias Travel
persistent table ztravel
draft table ztravel_d
lock master
total etag LastChangedAt
etag master LocalLastChangedAt
authorization master ( none )
late numbering
{
  create;
  update;
  delete;
  field ( readonly ) TravelID, TotalPrice, LastChangedAt, LocalLastChangedAt;
  field ( mandatory ) BeginDate, EndDate, BookingFee;

  static action deleteAll;
  internal action recalcTotalPrice;
  validation validateDates on save { create; field BeginDate, EndDate; }
  determination calcTotalPrice on modify { field BookingFee; }

  draft action Resume;
  draft action Edit;
  draft action Activate optimized;
  draft action Discard;
  draft determine action Prepare
  {
    validation validateDates;
  }
}
```

RAP BO consumer 쪽 코드의 뼈대입니다.

```abap
" 1) draft 로 만든다. 키(TravelID)는 아직 없고 %pid 가 인스턴스를 가리킨다
MODIFY ENTITY zr_travel
  CREATE AUTO FILL CID
  FIELDS ( BeginDate EndDate BookingFee )
  WITH VALUE #( ( %is_draft = if_abap_behv=>mk-on
                  BeginDate = '20261201' EndDate = '20261210' BookingFee = 30 ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported)
  MAPPED DATA(ls_mapped).

COMMIT ENTITIES.   " draft 테이블 ztravel_d 에만 들어간다

" 2) mapped 에서 %pid 를 꺼내 Activate action 의 입력을 만든다
DATA lt_activate TYPE TABLE FOR ACTION IMPORT zr_travel~Activate.
lt_activate = VALUE #( FOR ls_map IN ls_mapped-travel ( %pid = ls_map-%pid ) ).

MODIFY ENTITY zr_travel
  EXECUTE Activate AUTO FILL CID WITH lt_activate
  MAPPED ls_mapped
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.   " persistent table ztravel 로 옮겨지고 최종 키가 정해진다

" 3) validation 에 걸려 활성화되지 않은 draft 가 남았다면: 읽어서 고친 뒤 다시 활성화한다
READ ENTITY zr_travel
  ALL FIELDS WITH VALUE #( FOR ls_act IN lt_activate
                           ( %pky = ls_act-%pky %is_draft = if_abap_behv=>mk-on ) )
  RESULT DATA(lt_draft).

MODIFY ENTITY zr_travel
  UPDATE FROM VALUE #( FOR ls_draft IN lt_draft
                       ( %pid             = ls_draft-%pid
                         %is_draft        = if_abap_behv=>mk-on
                         EndDate          = ls_draft-BeginDate + 7
                         %control-EndDate = if_abap_behv=>mk-on ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.

MODIFY ENTITY zr_travel
  EXECUTE Activate AUTO FILL CID WITH lt_activate
  MAPPED ls_mapped FAILED ls_failed REPORTED ls_reported.

COMMIT ENTITIES.
```

## 알아두기

- **draft 표시** : draft 인스턴스를 만들거나 읽거나 고칠 때는 `%is_draft = if_abap_behv=>mk-on` 을 넣습니다.
- **`%pid`** : late numbering 에서는 저장하기 전까지 키가 없습니다. 생성의 `mapped` 응답에서 `%pid` 를 꺼내 두었다가 `Activate` action 의 입력(`TYPE TABLE FOR ACTION IMPORT ...~Activate`)과 읽기 요청(`%pky`)에 씁니다.
- **`AUTO FILL CID`** : `%cid` 를 따로 쓸 일이 없어 생성과 action 실행에 모두 `AUTO FILL CID` 를 붙였습니다.
- **`UPDATE FROM`** : 고칠 때 `FROM` 꼴을 쓰므로 바꿀 필드의 `%control` 을 직접 켭니다. 예제는 실패 종류에 따라 고칠 필드가 달라서, 필드마다 `%control` 을 켤지 끌지를 조건식으로 정합니다.
- **활성화 전과 후** : draft 를 저장한 직후에는 draft 테이블에만 줄이 있습니다. `Activate` 뒤에는 persistent table 에 줄이 생기고 draft 테이블이 비어 있습니다. 잘못된 인스턴스는 `Activate` 를 해도 persistent table 로 가지 않습니다.
- **Fiori Elements 앱으로 써 보기** : ADT 에서 service binding(서비스 바인딩) `DEMO_RAP_CALC_DR_SB` 를 엽니다(실행 클래스와 같은 패키지에 있습니다). Service Version Details 의 Local Service Endpoint 가 게시되어 있는지 확인합니다. entity(엔터티) 집합 `DEMO_CS_RAP_DRAFT_M` 을 고르고 Preview 를 누르면 브라우저에 앱이 열립니다. 로그온을 물으면 시스템 계정으로 들어갑니다. 새 계산을 만들고 저장하지 않은 채 draft 로 두면 계산 ID 가 초기값입니다. 저장해야 최종 키가 정해집니다. late numbering 이 눈에 보이는 대목입니다.

## 관련 항목

- [[abenbdl_late_numbering]]
- [[abenbdl_draft_action]]
- [[abenbdl_draft_action1_abexa]]
- [[abapderived_types_is_draft]]
- [[abapderived_types_pid]]
- [[abenderived_types_pid_abexa]]
- [[abapmodify_entity_entities_fields]]
- [[abenbdl_determinations]]
- [[abenbdl_validations]]
- [[abapeml_examples_abexas]]
