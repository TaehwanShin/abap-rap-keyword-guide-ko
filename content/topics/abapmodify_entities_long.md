---
title: MODIFY ENTITIES 문, 긴 형식
summary: RAP BO 하나에 속한 여러 entity 에 여러 변경 작업을 한 문장으로 묶어 실행하는 MODIFY ENTITIES OF 형식입니다.
keywords: MODIFY ENTITIES OF, MODIFY ENTITIES, 긴 형식, long form, ENTITY, IN LOCAL MODE, PRIVILEGED, FORWARDING, FAILED, EML_FAILED_MISSING_OK, 변경 작업, 여러 엔터티
---

## 문법

```syntax
MODIFY ENTITIES OF bdef [IN LOCAL MODE|[FORWARDING] PRIVILEGED]
           ENTITY entity1 operations
          [ENTITY entity2 operations]
          [...]
          [response_param].
```

## 설명

긴 형식은 RAP BO 하나에 속한 **여러 entity(엔터티)**에 **여러 변경 작업**을 한 문장으로 실행할 때 씁니다. entity 하나에 작업 하나만 하는 데 써도 됩니다.

- `bdef` 에는 RAP BO 의 root entity(루트 엔터티)를 적습니다. 별칭이 아니라 전체 이름이어야 합니다.
- `ENTITY` 뒤의 `entity1`, `entity2` 는 그 root entity 의 composition 트리에 들어 있는 entity 입니다. root entity 자신도 올 수 있습니다.
- BDEF 에 별칭을 정해 두었다면 `ENTITY` 뒤에는 별칭을 씁니다. 전체 이름을 쓰면 문법 경고가 납니다. root entity 를 작업 목록에 넣을 때도 마찬가지입니다.
- `ENTITY ...` 한 덩어리의 문법은 [[abapmodify_entity_short|짧은 형식]]과 같습니다. 어떤 작업을 쓸 수 있는지는 [[abapmodify_entity_entities_op]] 에서 봅니다.
- `ENTITY` 와 작업으로 이루어진 덩어리가 적어도 하나는 있어야 합니다.
- 같은 entity 를 `ENTITY` 뒤에 여러 번 적을 수 있습니다. 다만 같은 entity 에 같은 작업은 한 번만 쓸 수 있습니다.

추가 구문은 세 가지입니다.

| 추가 구문 | 뜻 |
| --- | --- |
| `IN LOCAL MODE` | [[abenbdl_actions_fc|feature control]] 과 [[abenbdl_authorization|권한 확인]]을 건너뜁니다. RAP BO 구현 안에서만 쓸 수 있습니다. 자세한 내용은 [[abapin_local_mode]] 를 봅니다. |
| `[FORWARDING] PRIVILEGED` | `PRIVILEGED` 는 privileged mode 로 RAP BO 에 접근합니다. RAP BO 런타임이 일부 권한 확인을 하지 않습니다. `FORWARDING PRIVILEGED` 는 privileged mode 를 켜지 않습니다. 지금 문맥이 privileged mode 일 때 그 상태를 이 요청으로 넘겨주기만 합니다. BDEF 에 `privileged` 가 지정돼 있어야 합니다. 자세한 내용은 [[abapeml_privileged]] 를 봅니다. |
| `response_param` | response parameter(응답 매개변수, `FAILED`, `REPORTED`, `MAPPED`)를 받습니다. 자세한 내용은 [[abapeml_response]] 를 봅니다. |

## 예제

여행을 하나 만들고, 방금 만든 여행의 상태를 고치고, 그 여행에 예약을 하나 붙인 뒤, 붙인 예약의 가격을 다시 고칩니다. 아직 키가 확정되지 않은 인스턴스는 `%cid` 로 이름표를 달고 `%cid_ref` 로 가리킵니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid customerid begindate enddate )
    WITH VALUE #(
      ( %cid       = 'cid1'
        travelid   = '00000001'
        agencyid   = '070001'
        customerid = '000011'
        begindate  = '20260301'
        enddate    = '20260310' ) )
  ENTITY travel
    " 방금 만든 여행을 %cid_ref 로 가리켜 고친다
    UPDATE FIELDS ( status )
    WITH VALUE #( ( %cid_ref = 'cid1' status = 'O' ) )
  ENTITY travel
    " composition _Booking 을 따라 예약을 만든다
    CREATE BY \_booking FIELDS ( bookingid flightprice )
    WITH VALUE #(
      ( %cid_ref = 'cid1'
        %target  = VALUE #( ( %cid        = 'cid2'
                              bookingid   = '0001'
                              flightprice = '500.00' ) ) ) )
  ENTITY booking
    " child entity 는 별칭으로 적는다
    UPDATE FIELDS ( flightprice )
    WITH VALUE #( ( %cid_ref = 'cid2' flightprice = '450.00' ) )
  FAILED   DATA(ls_failed)
  REPORTED DATA(ls_reported)
  MAPPED   DATA(ls_mapped).
```

## 알아두기

- RAP BO provider(제공자)는 saver method(세이버 메서드) [[abensaver_check_before_save|check_before_save]], [[abensaver_adjust_numbers|adjust_numbers]], [[abensaver_method_save|save]], [[abaprap_saver_meth_save_modified|save_modified]], [[abensaver_method_cleanup|cleanup]] 안에서 EML `MODIFY` 문을 쓰면 안 됩니다. interaction phase(상호작용 단계)와, save sequence(저장 순서) 가운데 [[abensaver_finalize|finalize]] 에서만 쓸 수 있습니다.
- readonly handler method(핸들러 메서드) 안에서도 EML `MODIFY` 문을 쓸 수 없습니다.
- 동적 형식이 아닌 `MODIFY` 문에 `IN LOCAL MODE` 도 없고 `FAILED` 도 없으면 문법 경고가 납니다. `FAILED` 를 받아 RAP BO consumer(사용자) 쪽에서 오류를 처리하는 것이 좋습니다. 경고만 끄려면 pragma `##EML_FAILED_MISSING_OK` 를 붙입니다.
- `MODIFY ENTITIES OF` 바로 뒤에는 root entity 의 전체 이름을, `ENTITY` 뒤에는 별칭을 씁니다. 두 자리를 헷갈리지 않게 합니다.

## 관련 항목

- [[abapmodify_entity_entities]]
- [[abapmodify_entity_short]]
- [[abapmodify_entities_operations_dyn]]
- [[abapmodify_entity_entities_op]]
- [[abapmodify_entity_entities_fields]]
- [[abapeml_response]]
- [[abeneml_modify_alternatives_abexa]]
- [[abapeml_modify_examples_abexas]]
