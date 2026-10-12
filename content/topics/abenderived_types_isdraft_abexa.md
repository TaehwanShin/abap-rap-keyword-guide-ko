---
title: %is_draft 사용 예제
summary: draft 를 쓰는 unmanaged RAP BO 에서 draft 표시 %is_draft 를 off 로 하고 on 으로 하며 active 인스턴스와 draft 인스턴스를 따로 다루는 예제입니다.
keywords: %is_draft, 초안 표시, draft indicator, if_abap_behv=>mk-on, if_abap_behv=>mk-off, %tky, Activate, 초안 인스턴스, 활성 인스턴스, with draft, 예제
---

## 설명

이 예제는 draft(`with draft`)을 쓰는 unmanaged RAP BO 에서 **draft 표시 `%is_draft`** 를 어떻게 쓰는지 보여 줍니다.

`%is_draft` 는 같은 키의 인스턴스가 active(활성) 쪽인지 draft 쪽인지 가리는 구성요소입니다.

- `if_abap_behv=>mk-off` : active 인스턴스를 다룹니다.
- `if_abap_behv=>mk-on` : draft 인스턴스를 다룹니다.

원문 예제는 `MODIFY` 요청을 두 번 보냅니다.

1. **active 인스턴스 만들고 고치기** — 모든 인스턴스에 `%is_draft` 를 off 로 하고 생성한 뒤, 같은 요청 안에서 방금 만든 인스턴스를 수정합니다. 수정할 때는 `%tky` 로 인스턴스를 가리킵니다. `%tky` 안의 키는 `%key-키필드`, `키필드`, `%pky-%key-키필드` 처럼 여러 방식으로 적는데, 구성요소 묶음이 어떻게 겹쳐 있는지 보여 주려는 것일 뿐 결과는 모두 같습니다. `COMMIT ENTITIES` 를 실행하면 persistent table 에 저장됩니다.
2. **draft 인스턴스 만들고 활성화하기** — 모든 인스턴스에 `%is_draft` 를 on 으로 하고 생성합니다. `COMMIT ENTITIES` 를 실행하면 draft 테이블에 저장됩니다. 이어서 draft action `Activate` 를 실행하고 다시 `COMMIT ENTITIES` 를 실행하면 persistent table 에 저장됩니다.

## 예제

공통 예제 모델의 `ZR_Travel` 이 draft 를 쓴다고 보고 같은 흐름을 줄여 썼습니다.

```abap
" 1) active 인스턴스: %is_draft 를 off 로 둔다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
    WITH VALUE #( ( %cid      = 'cid1'
                    %is_draft = if_abap_behv=>mk-off
                    travelid  = '00000001'
                    agencyid  = '070001'
                    customerid = '000010' ) )
  UPDATE FIELDS ( status )
    WITH VALUE #( ( %tky   = VALUE #( %is_draft = if_abap_behv=>mk-off
                                      travelid  = '00000001' )
                    status = 'O' ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.          " persistent table ztravel 에 저장된다

" 2) draft 인스턴스: %is_draft 를 on 으로 둔다
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
    WITH VALUE #( ( %cid      = 'cid2'
                    %is_draft = if_abap_behv=>mk-on
                    travelid  = '00000002'
                    agencyid  = '070002'
                    customerid = '000020' ) )
  MAPPED   ls_mapped
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.          " draft 테이블 ztravel_d 에만 저장된다

" 3) draft 를 활성화한다
MODIFY ENTITY zr_travel
  EXECUTE Activate AUTO FILL CID
    WITH VALUE #( ( %key-travelid = '00000002' ) )
  MAPPED   ls_mapped
  FAILED   ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.          " persistent table 로 옮겨지고 draft 테이블에서는 사라진다
```

### 실행하면

- 첫 번째 요청 뒤에는 persistent table 의 내용과 `mapped` 응답이 나옵니다. `mapped` 에서 `%cid` 와 키가 어떻게 짝지어졌는지, draft 표시가 어떤 값인지 볼 수 있습니다.
- 두 번째 요청에서는 draft 를 만든 직후의 `mapped` 와, `Activate` 를 실행한 뒤(저장 전)의 `mapped` 를 나란히 보여 줍니다. 두 응답을 견주면 draft 표시 값이 on 에서 off 로 바뀐 것을 확인할 수 있습니다. 원문 코드의 안내 글도 이렇게 적습니다. 원문 끝의 설명 글에는 거꾸로 "off 에서 on 으로" 라고 적혀 있는데, draft 를 만든 뒤 활성화하는 흐름과는 맞지 않습니다.
- 활성화 전에는 새 인스턴스가 draft 테이블에만 있고 persistent table 은 그대로입니다. draft 테이블의 데이터 필드 값은 behavior pool(동작 풀)의 구현 때문에 요청한 값과 다르게 바뀌어 있습니다.
- 활성화 뒤에는 그 인스턴스가 persistent table 에 들어가 있고 draft 테이블은 비어 있습니다.

## 알아두기

- 원문 예제의 데이터 모델에는 child entity(자식 엔터티)도 있지만 예제에서는 쓰지 않습니다.
- 원문 예제는 unmanaged 이라 생성·수정·draft action 의 실제 처리가 behavior pool 의 로컬 클래스에 구현되어 있습니다. handler method(핸들러 메서드) 설명은 [[abenrap_handler_methods_abexa]] 에 있습니다.

## 관련 항목

- [[abapderived_types_is_draft]]
- [[abapderived_types_tky]]
- [[abenbdl_with_draft]]
- [[abenbdl_draft_action]]
- [[abapcommit_entities]]
- [[abenderived_types_tky_abexa]]
