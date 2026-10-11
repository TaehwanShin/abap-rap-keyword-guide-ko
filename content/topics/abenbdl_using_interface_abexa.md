---
title: 예제 - interface 를 거친 RAP BO extension
summary: extension 가능한 managed BO 에 interface BDEF 를 얹고, 그 interface 를 거쳐 extension action 하나를 보태 실행해 보는 예제입니다.
keywords: using interface, extension, 인터페이스 BDEF, RAP BO 인터페이스, 확장 액션, extensible, 확장 동작 풀, EXECUTE, 예제
---

## 설명

이 예제는 RAP BO 를 **RAP BO interface 를 거쳐** 확장하는 흐름을 처음부터 끝까지 보여 줍니다. 등장하는 것은 세 가지입니다.

1. **원본 BO** — 루트, 자식, 손자, 증손자 네 노드가 composition 으로 이어진 managed BO 입니다. draft 를 쓰고, 머리말과 entity(엔터티)마다 `extensible` 을 적어 확장할 자리를 여러 군데 열어 두었습니다. 원본 behavior pool(동작 풀)은 instance 권한 확인 메서드 `get_instance_authorizations` 를 구현합니다. 특정 필드가 정해진 값이면 수정과 삭제를 막습니다.
2. **RAP BO interface** — 네 노드를 비추는 CDS 트랜잭션 interface 와 interface BDEF 입니다. interface BDEF 머리말에도 `extensible` 이 있습니다. 원문 예제의 interface 는 entity 별칭과 필드 이름을 바꿔 둡니다(`Root` → `RootInterface`, `CharField` → `CharInt`).
3. **BDEF extension(확장)** — `extension using interface` 로 interface 를 거쳐 루트 노드에 extension action 하나를 보탭니다. 루트 노드는 interface 에서 붙인 이름으로 가리킵니다. action 의 처리 내용은 extension behavior pool 에 있고, 실행하면 필드 값 하나를 바꿉니다.

## 예제

공통 예제 모델로 같은 구조를 줄여 썼습니다. 먼저 extension 을 허용하는 interface BDEF `ZI_Travel` 입니다.

```bdl
interface;
extensible;

define behavior for ZI_Travel alias Travel
{
  use create;
  use update;
  use delete;
  use association _Booking { create; }
}

define behavior for ZI_Booking alias Booking
{
  use update;
  use delete;
  use association _Travel;
}
```

BDEF extension 은 이 interface 를 거쳐 root entity(루트 엔터티)에 action `holdTravel` 을 보탭니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  action ( authorization : instance ) holdTravel;
}

extend behavior for Booking
{
}
```

extension behavior pool 에서 action 을 구현합니다. 여행 상태를 '보류(H)'로 바꿉니다.

```abap
METHOD holdtravel.
  MODIFY ENTITIES OF zi_travel IN LOCAL MODE
    ENTITY travel
      UPDATE FIELDS ( status )
      WITH VALUE #( FOR key IN keys ( %tky = key-%tky status = 'H' ) )
    FAILED failed
    REPORTED reported.
ENDMETHOD.
```

사용하는 쪽은 interface `ZI_Travel` 로 인스턴스를 만들고 extension action 을 실행합니다.

```abap
" 여행 두 건을 만든다
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid status )
    WITH VALUE #( ( %cid = 'cid1' travelid = '00000001' agencyid = '070001' status = 'N' )
                  ( %cid = 'cid2' travelid = '00000002' agencyid = '070002' status = 'N' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

" 한 건에만 extension action 을 실행한다
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    EXECUTE holdtravel
    FROM VALUE #( ( travelid = '00000001' ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

### 실행하면

- 원문 프로그램은 루트 인스턴스 두 건을 만들고, 그 가운데 한 건에 extension action 을 실행합니다.
- 생성 직후와 action 실행 직후에 데이터베이스 테이블 내용을 각각 보여 줍니다. action 을 실행한 인스턴스만 필드 값이 바뀌어 있습니다.

## 알아두기

- extension action 은 extension BDEF 에만 적었지만, 사용하는 쪽에서는 interface 의 여느 action 처럼 `EXECUTE` 로 부릅니다. interface 를 거친 extension 은 원본 BO 와 interface 를 함께 확장하기 때문입니다.
- extension BDEF 는 entity 를 interface 에서 붙인 이름으로 가리킵니다. 원문 예제에서는 `extend behavior for RootInterface` 입니다.
- 원문 예제의 extension 은 자식·손자·증손자 노드에도 `extend behavior for` 를 적었지만 본문은 비어 있습니다.

## 관련 항목

- [[abenbdl_using_interface]]
- [[abenbdl_rap_bo_interface]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_new_elem_ext]]
- [[abenbdl_extensibility_enabling_m_u]]
