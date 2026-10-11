---
title: 예제 - 필드 extension
summary: 테이블, CDS 뷰, interface 에 extension 필드를 차례로 보탠 뒤 BDEF extension 으로 field characteristics 와 동적 feature control 을 붙이는 예제입니다.
keywords: field extension, 필드 확장, 확장 필드, extend view entity, field characteristics, mandatory, suppress, readonly:update, features:instance, get_instance_features, 확장 동작 풀, 예제
---

## 설명

이 예제는 RAP BO 에 **extension(확장) 필드**를 보태고 그 필드에 동작을 붙이는 과정을 층별로 보여 줍니다.

**원본 BO**

- 데이터베이스 테이블 하나와, 그 테이블이 포함(include)하는 구조 하나가 있습니다. 둘 다 확장할 수 있게 표시되어 있습니다.
- root entity(루트 엔터티) 하나짜리 CDS 뷰와, extension 용 공개 창구로 쓰는 CDS 트랜잭션 interface 가 있습니다.
- 원본 BDEF 는 managed 이고 `extensible` 입니다. global authorization control(권한 제어)를 쓰고, 필드 몇 개에 속성을 주었으며, type mapping 에 `corresponding extensible` 을 적었습니다.
- 원본 behavior pool(동작 풀)은 메서드 두 개를 구현합니다. instance feature control(기능 제어)는 한 필드 값이 `A` 이면 다른 원본 필드를 readonly 로 만듭니다. global authorization control 은 수정은 허용하고 삭제는 막습니다.
- interface BDEF 도 `extensible` 입니다.

**extension**

1. 구조 extension 으로 테이블에 extension 필드를 보탭니다.
2. CDS 뷰 entity(엔터티) extension 으로 그 필드를 CDS 데이터 모델에 올립니다.
3. CDS 트랜잭션 interface 에도 entity extension 으로 같은 필드를 올립니다.
4. BDEF extension 이 interface 를 거쳐 extension 필드에 field characteristics(필드 특성)을 줍니다. `mandatory`, `suppress`, `features : instance`, `readonly : update` 를 하나씩 씁니다.
5. extension behavior pool 이 extension 필드의 동적 feature control 을 구현합니다. 한 extension 필드 값이 1000 보다 크면 다른 extension 필드가 readonly 가 되고, 1000 이하면 제한이 없습니다.

## 예제

공통 예제 모델로 줄여 썼습니다. 테이블 `ztravel` 에 extension 필드가 이미 보태져 있고, `ZR_Travel` 과 `ZI_Travel` 이 데이터 소스 별칭 `Travel` 을 extension 용으로 열어 두었다고 봅니다.

```cds
// 원본 뷰 extension
extend view entity ZR_Travel with
{
  Travel.zz_budget   as ZZBudget,
  Travel.zz_memo     as ZZMemo,
  Travel.zz_discount as ZZDiscount,
  Travel.zz_channel  as ZZChannel
}
```

```cds
// interface 뷰 extension
extend view entity ZI_Travel with
{
  Travel.ZZBudget,
  Travel.ZZMemo,
  Travel.ZZDiscount,
  Travel.ZZChannel
}
```

BDEF extension 은 extension 필드에 field characteristics 를 줍니다.

```bdl
extension using interface ZI_Travel
  implementation in class zbp_x_travel_ext unique;

extend behavior for Travel
{
  field ( mandatory ) ZZBudget;
  field ( suppress ) ZZMemo;
  field ( features : instance ) ZZDiscount;
  field ( readonly : update ) ZZChannel;
}
```

extension behavior pool 은 `ZZDiscount` 의 feature control 만 맡습니다.

```abap
METHOD get_instance_features.
  READ ENTITIES OF zi_travel IN LOCAL MODE
    ENTITY travel
      FIELDS ( zzbudget ) WITH CORRESPONDING #( keys )
    RESULT DATA(lt_travel).

  " 예산이 1000 을 넘으면 할인율을 고칠 수 없다
  result = VALUE #( FOR ls_travel IN lt_travel
    ( %tky              = ls_travel-%tky
      %field-zzdiscount = COND #( WHEN ls_travel-zzbudget > 1000
                                  THEN if_abap_behv=>fc-f-read_only
                                  ELSE if_abap_behv=>fc-f-unrestricted ) ) ).
ENDMETHOD.
```

사용하는 쪽에서 두 건을 만들고, 두 건 모두 `ZZDiscount` 를 고쳐 봅니다.

```abap
MODIFY ENTITIES OF zi_travel
  ENTITY travel
    CREATE FIELDS ( travelid status zzbudget )
    WITH VALUE #( ( %cid = '1' travelid = '00000001' status = 'A' zzbudget = 2000 )
                  ( %cid = '2' travelid = '00000002' status = 'B' zzbudget = 500 ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

MODIFY ENTITIES OF zi_travel
  ENTITY travel
    UPDATE FIELDS ( zzdiscount )
    WITH VALUE #( ( travelid = '00000001' zzdiscount = 7 )
                  ( travelid = '00000002' zzdiscount = 7 ) )
  FAILED ls_failed
  REPORTED ls_reported.

COMMIT ENTITIES.
```

### 실행하면

- 첫 번째 인스턴스는 feature control 때문에 extension 필드가 readonly 가 됩니다. 이 필드는 수정되지 않고 오류 메시지가 돌아옵니다. 두 번째 인스턴스는 조건 값이 1000 이하라 제한이 걸리지 않습니다.
- 원문 프로그램은 `reported` 에 담긴 메시지와 테이블 내용을 화면에 보여 줍니다.

handler method(핸들러 메서드)가 불리는 순서는 이렇습니다.

| 작업 | 실행 순서 |
| --- | --- |
| `CREATE` | 원본 behavior pool 의 global authorization control |
| `UPDATE` | 원본 behavior pool 의 global authorization control → 원본 behavior pool 의 필드 feature control → extension behavior pool 의 필드 feature control |

## 알아두기

- 원본 필드의 feature control 은 원본 behavior pool 이, extension 필드의 feature control 은 extension behavior pool 이 맡습니다. 수정할 때는 두 메서드가 차례로 불립니다.
- 원문 예제는 extension 필드를 테이블, 원본 CDS 뷰, interface 뷰 세 층에 차례로 보탠 뒤, BDEF extension 에서 interface 쪽 이름으로 가리킵니다.
- field characteristics 는 extension 필드에만 줄 수 있습니다. 쓸 수 있는 속성 목록은 [[abenbdl_new_elem_ext]] 에 있습니다.

## 관련 항목

- [[abenbdl_new_elem_ext]]
- [[abenbdl_in_class_unique_ext]]
- [[abenbdl_using_interface]]
- [[abenbdl_field_char]]
- [[abaphandler_meth_features]]
- [[abapmodify_entity_entities_op]]
