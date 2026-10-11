---
title: %key (기본 키 묶음)
summary: RAP BO 인스턴스의 기본 키 필드를 모두 묶은 구성요소 묶음으로, 저장된 인스턴스를 가리키는 식별자 구실을 합니다.
keywords: %key, 기본 키, primary key, 구성요소 묶음, %tky, %pky, %data, %control, CORRESPONDING, 키 묶음 대입, TYPE TABLE FOR KEY OF, 임시 키
---

## 설명

`%key` 는 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**입니다. RAP BO 인스턴스의 기본 키 필드가 모두 들어 있어서, 저장된 인스턴스를 가리키는 식별자로 씁니다.

interaction phase(상호작용 단계)의 EML 문에서 `%key` 를 쓸 수 있는 자리에는 [[abapderived_types_tky|%tky]] 도 쓸 수 있습니다. `%tky` 안에 `%key` 가 들어 있기 때문입니다. 다만 원문의 `%tky` 항목은 생성 작업을 예외로 둡니다. draft action 이나 save action 의 구현처럼 `%tky` 가 없는 자리도 있습니다. 이런 예외가 아니라면 [[abenbdl_with_draft|draft]] 를 쓰지 않는 BO 에서도 `%key` 대신 `%tky` 를 쓰기를 권합니다. `%tky` 에는 draft 표시 [[abapderived_types_is_draft|%is_draft]] 도 들어 있어서, 나중에 draft 시나리오로 바꾸더라도 코드를 많이 고치지 않아도 됩니다.

### 타입

`%key` 안의 키 필드는 원래 타입 그대로입니다. 다만 [[abapderived_types_control|%control]] 안에서 쓰일 때는 키 필드의 타입이 `ABP_BEHV_FLAG` 입니다.

### 쓰이는 곳

[[abaptype_table_for|TYPE TABLE FOR]] 와 [[abaptype_structure_for|TYPE STRUCTURE FOR]] 의 다음 타입에 들어 있습니다.

- `CREATE`, `UPDATE`, `DELETE`
- `READ IMPORT`, `READ RESULT`
- `READ LINK` (구조 `SOURCE` 와 `TARGET` 의 일부로)
- `ACTION IMPORT`, `ACTION RESULT`, `ACTION REQUEST` (instance action)
- `FUNCTION IMPORT`, `FUNCTION RESULT`, `FUNCTION REQUEST` (instance function)
- `PERMISSIONS KEY`
- `DETERMINATION`, `VALIDATION`
- `FAILED [EARLY|LATE]`, `MAPPED [EARLY|LATE]`, `REPORTED [EARLY|LATE]`
- `CHANGE`
- `[INSTANCE] FEATURES KEY`, `[INSTANCE] FEATURES RESULT`
- `[INSTANCE] AUTHORIZATION KEY`, `[INSTANCE] AUTHORIZATION RESULT`

다음 구성요소 묶음 안에도 들어 있습니다.

- `%control`
- [[abapderived_types_param|%param]]
- [[abapderived_types_tmp|%tmp]]
- [[abapderived_types_pky|%pky]]

### 키 묶음끼리 대입하기

키 전체를 가리킬 때는 키 필드를 하나씩 늘어놓지 말고 키 구성요소 묶음을 쓰는 것이 좋습니다. 될 수 있으면 `%tky` 를 씁니다.

묶음끼리 대입할 때 다음 경우에는 타입이 맞는다는 보장이 없어서 문법 경고가 납니다.

- **같은 entity(엔터티)의 서로 다른 묶음을 섞을 때.** 예) `wa-%tky = wa-%key`. 두 묶음에 든 구성요소가 똑같은 경우(late numbering 도 draft 도 아닌 BO 의 `%tky` 와 `%key`)에도 이런 대입은 피합니다.
- **서로 다른 entity 의 같은 묶음을 섞을 때.** 예) `wa_root-%tky = wa_child-%tky`. 나중에 구성요소가 늘어나면, 전에는 되던 대입이 문법 오류가 될 수 있습니다.
- **키 묶음과 구성요소가 같은 구조 타입을 직접 만들어, 그 타입의 데이터 객체를 원래 키 묶음에 대입할 때.**

이런 경우에는 `CORRESPONDING` 연산자를 써서 타입이 맞게 합니다.

```abap
ls_target-%tky = CORRESPONDING #( ls_source-%tky ).
ls_target-%key = CORRESPONDING #( ls_source-%key ).
ls_target-%pky = CORRESPONDING #( ls_source-%pky ).
```

반대로 **같은 entity 의 같은 묶음**끼리는 내용이 똑같으므로 바로 대입해도 문법 경고가 나지 않습니다. 이때는 바로 대입하는 쪽을 권합니다. `CORRESPONDING` 은 필요 없고 성능도 더 나쁩니다. response parameter(응답 매개변수) `failed` 와 `reported` 에 키 묶음을 넣을 때가 그런 경우입니다.

```abap
APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
```

## 예제

키 필드 `TravelID` 를 가리키는 여러 방법입니다. `%key` 가 다른 묶음 안에도 들어 있어서 길이 여러 갈래입니다.

```abap
MODIFY ENTITY zr_travel
  CREATE FIELDS ( travelid agencyid )
  WITH VALUE #(
    ( %cid = 'cid1' %key-travelid          = '00000001' agencyid = '070001' )
    ( %cid = 'cid2' %key = VALUE #( travelid = '00000002' ) agencyid = '070002' )
    ( %cid = 'cid3' travelid               = '00000003' agencyid = '070003' )
    ( %cid = 'cid4' %data-%key-travelid    = '00000004' agencyid = '070004' )
    ( %cid = 'cid5' %data-travelid         = '00000005' agencyid = '070005' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).

" 수정에서는 %tky, %pky 를 거쳐서도 가리킬 수 있다
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( status )
  WITH VALUE #(
    ( %key-travelid           = '00000011' status = 'A' )
    ( travelid                = '00000012' status = 'A' )
    ( %tky-%key-travelid      = '00000013' status = 'A' )
    ( %tky-travelid           = '00000014' status = 'A' )
    ( %tky-%pky-%key-travelid = '00000015' status = 'A' )
    ( %tky-%pky-travelid      = '00000016' status = 'A' )
    ( %pky-travelid           = '00000017' status = 'A' )
    ( %pky-%key-travelid      = '00000018' status = 'A' )
    ( %data-%key-travelid     = '00000019' status = 'A' )
    ( %data-travelid          = '00000020' status = 'A' ) )
  FAILED FINAL(ls_failed_upd)
  REPORTED FINAL(ls_reported_upd).
```

## 알아두기

- late numbering 에서는 interaction phase 동안 [[abapderived_types_pid|%pid]] 뿐 아니라 `%key` 에도 임시 키가 들어 있을 수 있습니다. 임시 키는 [[abensaver_adjust_numbers]] 메서드에서 최종 키 값으로 바뀝니다.
- `TYPE TABLE FOR KEY OF` 로 선언한 내부 테이블이나 `TYPE STRUCTURE FOR KEY OF` 로 선언한 구조에는 키 필드가 `%key` 묶음으로 들어 있지 않고 **바로** 들어 있습니다.

## 관련 항목

- [[abapderived_types_tky]]
- [[abapderived_types_pky]]
- [[abapderived_types_keys_identifiers]]
- [[abapderived_types_control]]
- [[abapderived_types_data]]
- [[abenderived_types_key_abexa]]
