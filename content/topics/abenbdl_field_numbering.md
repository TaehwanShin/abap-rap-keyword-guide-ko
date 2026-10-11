---
title: 필드 numbering (field numbering:managed)
summary: UUID 타입 키 필드의 값을 RAP 프레임워크가 생성 때 자동으로 채우게 하는 managed internal numbering 문법입니다.
keywords: numbering:managed, field ( numbering : managed ), 관리형 번호 부여, 관리형 내부 번호 부여, UUID, 자동 채번, 키 자동 생성, 선택적 외부 번호 부여, RAW 16
---

## 문법

```syntax
... field(numbering:managed) Field1, Field2, ...;
```

## 설명

필드에 **managed internal numbering**를 정합니다. 새 인스턴스를 만들 때 이 필드에 고유한 값이 자동으로 들어갑니다. RAP BO consumer(사용자)는 값을 넣을 필요가 없습니다. RAP 프레임워크가 모두 처리하므로 behavior pool(동작 풀)에 구현할 것도 없습니다.

대상 필드는 두 조건을 모두 갖춰야 합니다.

- 기본 키 필드여야 합니다. 바탕이 되는 CDS 데이터 모델에서 `key` 로 정의된 필드입니다.
- 데이터 타입이 `RAW`, 길이 16 이어야 합니다. 곧 UUID 입니다.

### readonly 와 함께 쓰기

키 필드를 [[abenbdl_field_char|readonly]] 로도 지정할지는 선택입니다. 어느 쪽이냐에 따라 동작이 달라집니다.

| 지정 | 동작 |
| --- | --- |
| `numbering : managed, readonly` | 사용자가 키 값을 넘길 수 없습니다. 언제나 프레임워크가 채우는 **internal numbering**입니다. |
| `numbering : managed` 만 | 사용자가 키 값을 줄 수도 있습니다. 사용자가 초기값(빈 값)을 넘겼을 때만 프레임워크가 채웁니다. 이것을 **선택적 external numbering**라고 합니다. |

## 예제

공통 예제 모델에 UUID 키 필드 `TravelUUID` 가 있다고 하고, 이 필드를 프레임워크가 채우게 합니다.

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update;
  delete;

  // UUID 키를 프레임워크가 채우고, 사용자는 넘길 수 없다
  field ( numbering : managed, readonly ) TravelUUID;
}
```

EML 로 키 없이 인스턴스를 만듭니다. 저장한 뒤 테이블을 보면 키 필드에 값이 들어 있습니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( agencyid customerid )
    WITH VALUE #( ( %cid = 'cid1' agencyid = '070001' customerid = '000011' )
                  ( %cid = 'cid2' agencyid = '070002' customerid = '000012' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.
```

## 알아두기

- managed RAP BO 에서만 쓸 수 있습니다.
- 번호를 매기는 방법을 직접 정하고 싶다면 [[abenbdl_early_numb|early numbering]] 을 씁니다.

## 관련 항목

- [[abenbdl_early_numb]]
- [[abenbdl_late_numbering]]
- [[abenbdl_field_char]]
