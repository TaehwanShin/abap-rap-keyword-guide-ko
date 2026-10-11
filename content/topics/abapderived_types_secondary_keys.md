---
title: BDEF derived type 의 보조 테이블 키
summary: BDEF derived type 으로 만든 내부 테이블에 미리 들어 있는 보조 키(entity, cid, draft, pid, id)와, BDEF 에서 직접 만드는 보조 키를 설명합니다.
keywords: secondary table key, 보조 테이블 키, 보조 키, entity, cid, draft, pid, id, KEY entity, USING KEY, define secondary key, BDEF secondary key, TYPE TABLE FOR, strict(2), 정렬 키, non-unique sorted key
---

## 설명

BDEF derived type(BDEF 파생 타입)에는 보조 테이블 키가 들어 있을 수 있습니다. 두 가지가 있습니다.

- **미리 정의된 보조 키** : 프레임워크가 넣어 둔 키입니다.
- **직접 만든 보조 키** : BDEF 에서 선언한 키입니다.

### 미리 정의된 보조 키

`TYPE TABLE FOR ...`([[abaptype_table_for]])로 선언한 내부 테이블은 기본 키가 비어 있는 표준 테이블입니다. 대신 대부분 미리 정의된 보조 키가 있습니다. 이 보조 키는 언제나 **중복을 허용하는 정렬 키**(non-unique sorted key)입니다.

지금 쓸 수 있는 보조 키는 다음과 같습니다.

| 보조 키 | 내용 |
| --- | --- |
| `entity` | 늘 [[abapderived_types_key]] 를 포함합니다. `%key` 가 구성요소로 들어 있는 모든 BDEF derived type 에 있습니다. |
| `cid` | [[abapderived_types_cid]] 또는 [[abapderived_types_cid_ref]] 를 포함합니다. derived type 에 따라 [[abapderived_types_key]] 와 [[abapderived_types_pid]] 도 들어갑니다. |
| `draft` | [[abapderived_types_is_draft]] 를 포함합니다. draft 를 쓰는 경우([[abenbdl_with_draft]])에만 있습니다. derived type 에 따라 [[abapderived_types_pid]] 와 [[abapderived_types_key]] 도 들어갑니다. |
| `pid` | late numbering 을 쓰는 경우에만 있습니다. [[abapderived_types_pid]] 를 포함합니다. derived type 에 따라 [[abapderived_types_tmp]] 와 [[abapderived_types_key]] 도 들어갑니다. 이 키는 `id` 라는 이름으로도 쓸 수 있습니다. |
| `id` | 상황에 따라 `entity`, `draft`, `pid` 가운데 하나를 가리키는 별칭입니다. |

`id` 가 무엇을 가리키는지는 이렇게 정해집니다.

- derived type 에 `entity` 는 있고 `draft` 와 `pid` 는 없으면 `id` 는 `entity` 입니다.
- derived type 에 `pid` 가 있으면 `id` 는 `pid` 입니다. `entity` 가 있든, draft 를 쓰는 RAP BO 든 상관없습니다.
- derived type 에 `pid` 는 없고 `draft` 가 있으면 `id` 는 `draft` 입니다. `entity` 가 있어도 그렇습니다.

`id` 를 쓰려면 BDEF 에 strict mode `strict(2);` 를 적어야 합니다.

### 직접 만든 보조 키

BDEF derived type 에 쓸 보조 키를 직접 만들 수 있습니다. BDEF 에서 선언합니다([[abenbdl_define_key]]). 이 키는 RAP key function 의 시그니처를 정하는 데 쓰고, 보조 테이블 키를 적는 ABAP 문에서도 쓸 수 있습니다.

- [[abapderived_types_data]] 가 들어 있는 모든 BDEF derived type 에 적용됩니다. 이런 타입에는 보조 테이블 인덱스가 만들어집니다. 그 밖의 derived type 에는 만들어지지 않습니다.
- 미리 정의된 보조 키처럼 언제나 중복을 허용하는 정렬 키입니다.

## 예제

`TYPE TABLE FOR CREATE` 테이블에서 미리 정의된 보조 키 `cid` 와 `entity` 로 줄을 찾습니다.

```abap
DATA lt_create TYPE TABLE FOR CREATE zr_travel.

lt_create = VALUE #(
  %control-travelid = if_abap_behv=>mk-on
  %control-agencyid = if_abap_behv=>mk-on
  ( %cid = 'T1' %key-travelid = '00000001' agencyid = '070001' )
  ( %cid = 'T2' %key-travelid = '00000002' agencyid = '070002' ) ).

" 보조 키 cid 로 찾기
DATA(ls_by_cid) = lt_create[ KEY cid COMPONENTS %cid          = 'T1'
                                                %key-travelid = '00000001' ].

" 보조 키 entity 로 찾기
DATA(ls_by_key) = lt_create[ KEY entity COMPONENTS %key-travelid = '00000002' ].
```

직접 만든 보조 키는 BDEF 에서 먼저 선언합니다.

```bdl
define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  create;
  update;
  delete;

  define secondary key byAgency { AgencyID; Status; }
}
```

그런 다음 읽기 결과를 그 키 순서대로 돕니다. `ALL FIELDS` 로 읽었으므로 키를 이루는 필드가 모두 요청되어 있습니다.

```abap
READ ENTITIES OF zr_travel
  ENTITY travel
    ALL FIELDS WITH VALUE #( ( travelid = '00000001' )
                             ( travelid = '00000002' )
                             ( travelid = '00000003' ) )
  RESULT DATA(lt_travel)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

" AgencyID, Status 순서로 정렬된 보조 인덱스를 따라 돈다
LOOP AT lt_travel INTO DATA(ls_travel) USING KEY byagency.
  " ...
ENDLOOP.
```

## 알아두기

- 어떤 보조 키가 있는지는 BDEF 에 적은 내용에 따라 달라집니다. `draft` 는 draft 를 쓸 때만, `pid` 는 late numbering 을 쓸 때만 있습니다.
- 직접 만든 보조 키를 ABAP 문에서 쓰는 것은, 보조 키 전체를 요청했을 때만 의미가 있습니다. EML 읽기 결과를 도는 경우라면 키를 이루는 모든 필드에 [[abapderived_types_control]] 표시가 켜져 있어야 합니다.
- 여러 BDEF derived type 과 그 키를 직접 살펴보려면 SAP 데모 클래스 `CL_DEMO_RAP_DSPLY_DER_TYPE_KS` 를 실행합니다. 세 가지 경우를 보여 줍니다: 바깥에서 번호를 주는 경우(draft 도 late numbering 도 아님), late numbering([[abenbdl_late_numbering]], draft 아님), draft([[abenbdl_with_draft]]). 출력의 `KEY_KIND` 필드에서 `E` 는 빈 키, `U` 는 사용자 정의 키를 뜻합니다.
- 많은 BDEF derived type 은 구현 클래스 밖에서 변수로 선언할 수 없습니다. 그래서 위 데모는 전역 클래스에 여러 derived type 으로 선언한 변수를 두고, 각 클래스의 `get_keys`, `get_keys_ln`, `get_keys_dt` 메서드가 키 테이블을 내어 줍니다.

## 관련 항목

- [[abaptype_table_for]]
- [[abenbdl_define_key]]
- [[abapderived_types_key]]
- [[abapderived_types_cid]]
- [[abapderived_types_is_draft]]
- [[abapderived_types_pid]]
- [[abapderived_types_data]]
- [[abenbdl_late_numbering]]
