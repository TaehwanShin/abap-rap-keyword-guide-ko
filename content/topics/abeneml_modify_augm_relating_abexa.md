---
title: 예제 - MODIFY AUGMENTING 과 RELATING TO
summary: augment 하면서 새로 넣은 인스턴스가 실패했을 때 RELATING TO 로 원래 요청의 인스턴스와 이어 주는 방법을 보여 주는 예제입니다.
keywords: MODIFY AUGMENTING 예제, RELATING TO, BY, ABP_BEHV_RELATING_TAB, augment, 보강, 프로젝션, projection, precheck, 사전 점검, failed, reported, RAP BO 계약
---

## 설명

projection BO 에서 `MODIFY` 문에 `AUGMENTING` 과 `RELATING TO` 를 함께 쓰는 예제입니다.

- base BDEF(기반 BDEF) 는 managed 이고 entity(엔터티)가 하나입니다. 수정 작업에 precheck 가 걸려 있습니다(`update ( precheck );`).
- projection BDEF 는 base BDEF 의 standard operation(표준 작업)을 가져다 쓰면서 수정 작업만 augment 합니다(`use update ( augment );`).

projection behavior pool(동작 풀)의 `augment_update` 는 좀 별나게 구현되어 있습니다. 원래 요청에 들어온 인스턴스를 augment 하지 않습니다. 그 대신 **다른 인스턴스** 하나의 필드 값을 고칩니다. 예제를 위해 일부러 그렇게 한 것이고, 다른 인스턴스는 키 값이 하나 큰 인스턴스로 정합니다.

이때 넣는 필드 값 가운데 어떤 것은 base BO(기반 BO) 의 precheck 에서 일부러 걸리게 되어 있습니다. precheck 가 그 값을 거절하면 `failed` 와 `reported` 에 내용이 들어갑니다.

보탠 인스턴스는 원래 요청에 없던 것입니다. 그래서 `ABP_BEHV_RELATING_TAB` 타입 변수를 채워, 보탠 인스턴스가 원래 요청의 어느 인스턴스에서 비롯했는지 알려 줍니다.

## 예제

여행 모델로 줄여 쓴 것입니다. base BDEF 의 수정 작업에 precheck 를 걸고, projection BDEF 에서 수정 작업을 augment 합니다.

base BDEF

```bdl
managed implementation in class zbp_r_travel unique;
strict ( 2 );

define behavior for ZR_Travel alias Travel
persistent table ztravel
lock master
authorization master ( none )
{
  create;
  update ( precheck );
  delete;
  field ( readonly : update ) TravelID;
}
```

projection BDEF

```bdl
projection implementation in class zbp_c_travel unique;
strict ( 2 );

define behavior for ZC_Travel alias Travel
{
  use create;
  use update ( augment );
  use delete;
}
```

base BO 의 precheck 는 상태를 `X` 로 바꾸려는 수정을 거절합니다.

```abap
METHOD precheck_update.
  LOOP AT entities INTO DATA(ls_entity) WHERE status = 'X'.
    APPEND VALUE #( %tky = ls_entity-%tky ) TO failed-travel.
    APPEND VALUE #( %tky = ls_entity-%tky
                    %msg = new_message_with_text(
                             severity = if_abap_behv_message=>severity-error
                             text     = '상태 X 로는 바꿀 수 없습니다.' ) )
           TO reported-travel.
  ENDLOOP.
ENDMETHOD.
```

projection 의 `augment_update` 는 번호가 하나 큰 여행을 함께 고치고, 그 줄이 원래 요청의 몇 번째 줄에서 나왔는지 `lt_relating` 에 적습니다.

```abap
METHOD augment_update.
  DATA lt_augment  TYPE TABLE FOR UPDATE zr_travel.
  DATA lt_relating TYPE abp_behv_relating_tab.

  LOOP AT entities INTO DATA(ls_entity).
    DATA(lv_index) = sy-tabix.

    " 원래 요청에 없던 다른 여행을 함께 고친다
    APPEND VALUE #( travelid        = ls_entity-travelid + 1
                    status          = 'X'
                    %control-status = if_abap_behv=>mk-on ) TO lt_augment.

    " 방금 넣은 줄은 entities 의 lv_index 번째 줄에서 비롯했다
    APPEND lv_index TO lt_relating.
  ENDLOOP.

  MODIFY AUGMENTING ENTITIES OF zr_travel
    ENTITY zr_travel
      UPDATE FROM lt_augment RELATING TO entities BY lt_relating.
ENDMETHOD.
```

RAP BO consumer(사용자)는 여행 `00000002` 만 고칩니다.

```abap
MODIFY ENTITY zc_travel
  UPDATE FIELDS ( agencyid )
  WITH VALUE #( ( travelid = '00000002' agencyid = '070002' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

augmentation 으로 여행 `00000003` 의 수정이 함께 들어가고 precheck 에서 거절됩니다. 그런데 `ls_failed` 에는 `00000003` 이 아니라 사용자가 보낸 `00000002` 가 들어옵니다. `RELATING TO` 가 둘을 이어 주었기 때문입니다.

## 알아두기

원문 예제를 실행하면 다음과 같이 됩니다.

- 먼저 projection BO 로 인스턴스 여러 개를 만들어 둡니다. 그 뒤 수정 작업을 세 번 합니다.
- 첫 번째 수정은 인스턴스 하나의 필드 하나를 고칩니다. 이 요청은 성공하고, augmentation 요청으로 다른 인스턴스 하나도 함께 고쳐집니다. 데이터베이스 테이블 내용을 읽어 화면에 보여 주고, `RELATING` 에 쓴 테이블의 내용도 보여 줍니다.
- 두 번째와 세 번째 수정은 첫 번째와 비슷하지만, augmentation 요청이 precheck 에 걸려 일부러 실패합니다. 이른 응답과 늦은 응답의 `failed`, `reported` 가 화면에 나옵니다.
- 두 번째 수정에서 원래 인스턴스는 키가 2 인 것입니다. augmentation 요청은 키가 3 인 인스턴스를 고치려다 precheck 에서 실패합니다. 이른 `failed` 응답에는 키 3 이 아니라 **키 2** 인 인스턴스의 문제로 올라옵니다. 키 3 인 인스턴스는 `reported` 응답에 나옵니다. 세 번째 수정도 마찬가지입니다.
- `RELATING TO` 없이 `MODIFY AUGMENTING` 을 쓰면 보탠 인스턴스를 원래 인스턴스와 이을 수 없고, RAP BO 계약을 어기게 됩니다. 원문 구현에는 이 경우가 주석 처리된 코드로 들어 있습니다.

## 관련 항목

- [[abapmodify_aug_entity_entities]]
- [[abeneml_modify_augmenting_abexa]]
- [[abenbdl_augment_projection]]
- [[abenbdl_precheck]]
- [[abaphandler_meth_precheck]]
- [[abaprap_impl_rules]]
