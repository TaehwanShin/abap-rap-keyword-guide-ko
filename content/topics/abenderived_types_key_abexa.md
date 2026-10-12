---
title: %key 사용 예제
summary: managed RAP BO 의 생성·수정 요청에서 키를 %key, %tky, %pky, %data 등 여러 표기로 적어도 같은 키를 가리킨다는 것을 보여 주는 예제입니다.
keywords: %key, 키, 기본 키, %tky, %pky, %data, 구성요소 묶음, component group, MODIFY ENTITY, CREATE, UPDATE, 관리형, 예제
---

## 설명

이 예제는 managed RAP BO 를 상대로 interaction phase(상호작용 단계)에서 **`%key`** 를 어떻게 적는지 보여 줍니다.

`%key` 는 entity(엔터티)의 기본 키 필드를 모아 둔 구성요소 묶음입니다. BDEF derived type(BDEF 파생 타입)에서는 구성요소 묶음이 서로 겹쳐 있어서, 같은 키 필드를 여러 경로로 가리킬 수 있습니다. 원문 예제는 `MODIFY` 요청 하나에 생성과 수정을 함께 넣고, 줄마다 표기를 일부러 바꿔 적습니다.

생성에서 쓰는 표기

| 표기 | 뜻 |
| --- | --- |
| `%key-키필드 = ...` | `%key` 묶음을 거쳐 키 필드를 적습니다. |
| `%key = VALUE #( 키필드 = ... )` | `%key` 묶음을 통째로 채웁니다. |
| `키필드 = ...` | 묶음 이름 없이 키 필드를 바로 적습니다. |
| `%data-%key-키필드 = ...` | `%data` 안의 `%key` 를 거칩니다. |
| `%data-키필드 = ...` | `%data` 를 거쳐 키 필드를 적습니다. |

수정에서는 위 표기에 더해 `%tky-%key-키필드`, `%tky-키필드`, `%tky-%pky-%key-키필드`, `%tky-%pky-키필드`, `%pky-키필드`, `%pky-%key-키필드` 도 씁니다. 어느 표기를 쓰든 가리키는 키는 같습니다.

## 예제

공통 예제 모델로 같은 내용을 줄여 썼습니다. 여행 세 건을 만들면서 키를 서로 다르게 적고, 곧바로 그 세 건을 수정합니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid customerid )
    WITH VALUE #(
      " %key 묶음을 거쳐서
      ( %cid = 'cid1' %key-travelid = '00000001'
        agencyid = '070001' customerid = '000010' )
      " %key 묶음을 통째로
      ( %cid = 'cid2' %key = VALUE #( travelid = '00000002' )
        agencyid = '070002' customerid = '000020' )
      " 키 필드를 바로
      ( %cid = 'cid3' travelid = '00000003'
        agencyid = '070003' customerid = '000030' ) )
  UPDATE FIELDS ( status )
    WITH VALUE #(
      ( %key-travelid           = '00000001' status = 'A' )
      ( %tky-travelid           = '00000002' status = 'A' )
      ( %pky-%key-travelid      = '00000003' status = 'A' ) )
  MAPPED   DATA(ls_mapped)
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported).

COMMIT ENTITIES.

IF sy-subrc <> 0.
  " save sequence 에서 문제가 생겼다
ENDIF.
```

### 실행하면

- `COMMIT ENTITIES` 를 실행하면 인스턴스가 persistent table 에 저장됩니다.
- 원문 예제는 저장 뒤 persistent table 의 내용과 root entity(루트 엔터티)의 `mapped`, `failed` 응답을 화면에 보여 줍니다.
- 원문 예제는 인스턴스를 5개 만들고 수정은 키 10개에 요청합니다.

## 알아두기

- 원문 예제는 `CREATE FROM` 형태를 쓰기 때문에 `%control` 에서 필드마다 `if_abap_behv=>mk-on` 을 직접 설정합니다. 위 예제처럼 `FIELDS ( ... ) WITH` 형태를 쓰면 `%control` 을 직접 채우지 않아도 됩니다.
- 원문 예제의 behavior pool(동작 풀)에는 이 예제와 관련된 구현이 없습니다. managed 이라 생성과 수정을 managed RAP BO provider(제공자)가 처리합니다.
- 키 표기와 인스턴스를 가리키는 방법을 한데 정리한 글은 [[abapderived_types_keys_identifiers]] 입니다.

## 관련 항목

- [[abapderived_types_key]]
- [[abapderived_types_keys_identifiers]]
- [[abenderived_types_tky_abexa]]
- [[abenbdl_impl_type]]
- [[abapcommit_entities]]
