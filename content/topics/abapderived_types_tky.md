---
title: %tky (트랜잭션 키)
summary: 인스턴스를 빈틈없이 가리키는 트랜잭션 키로, %key 와 draft 표시 %is_draft 등을 묶은 구성요소 묶음이며 모든 시나리오에서 쓰기를 권합니다.
keywords: %tky, transactional key, 트랜잭션 키, %key, %is_draft, %pid, %pky, 구성요소 묶음, draft, 초안, CORRESPONDING, 키 묶음 대입
---

## 설명

`%tky` 는 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**이며 **트랜잭션 키**를 나타냅니다. interaction phase(상호작용 단계)에서 내부 처리가 이루어지려면, RAP BO 인스턴스는 언제나 트랜잭션 키로 유일하게 가려져야 합니다.

`%tky` 안에는 [[abapderived_types_key|%key]] 와 draft 표시 [[abapderived_types_is_draft|%is_draft]] 가 들어 있습니다. 그래서 [[abenbdl_with_draft|draft]] 시나리오에 특히 잘 맞습니다.

`%key` 가 들어 있으므로, draft 를 쓰지 않는 BO 에서도 기본 키를 가리킬 때 `%tky` 를 쓸 수 있습니다. 오히려 그렇게 쓰기를 **권합니다**. 나중에 draft 시나리오로 바꾸더라도 키와 `%is_draft` 때문에 코드를 많이 고치지 않아도 되기 때문입니다.

### 쓰이는 곳

interaction phase 의 EML 문에서 `%key` 를 쓸 수 있는 자리에는 `%tky` 도 쓸 수 있습니다. 다만 **생성 작업은 예외**입니다.

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

반대로 **같은 entity 의 같은 묶음**끼리는 내용이 똑같으므로 바로 대입해도 문법 경고가 나지 않습니다. 이때는 바로 대입하는 쪽을 권합니다(`ls_travel1-%tky = ls_travel2-%tky`). `CORRESPONDING` 은 필요 없고 성능도 더 나쁩니다. response parameter(응답 매개변수) `failed` 와 `reported` 에 키 묶음을 넣을 때가 그런 경우입니다.

## 예제

draft 를 켠 여행 BO 에서 draft 인스턴스 두 건의 상태를 바꿉니다. `%tky` 하나로 키와 draft 표시를 함께 넘깁니다.

```abap
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( status )
  WITH VALUE #(
    ( %tky   = VALUE #( %is_draft     = if_abap_behv=>mk-on
                        %key-travelid = '00000004' )
      status = 'A' )
    ( %tky   = VALUE #( %is_draft     = if_abap_behv=>mk-on
                        %key-travelid = '00000005' )
      status = 'A' ) )
  MAPPED FINAL(ls_mapped)
  FAILED FINAL(ls_failed)
  REPORTED FINAL(ls_reported).
```

handler method(핸들러 메서드)에서는 넘어온 `%tky` 를 그대로 다음 문과 response parameter 에 넘깁니다.

```abap
READ ENTITIES OF zr_travel IN LOCAL MODE
  ENTITY travel
    FIELDS ( begindate enddate ) WITH CORRESPONDING #( keys )
  RESULT DATA(lt_travel).

LOOP AT lt_travel INTO DATA(ls_travel).
  IF ls_travel-enddate < ls_travel-begindate.
    " 같은 entity 의 같은 묶음이므로 바로 대입한다
    APPEND VALUE #( %tky = ls_travel-%tky ) TO failed-travel.
  ENDIF.
ENDLOOP.
```

## 알아두기

- 어떤 상황에서든 `%tky` 를 쓰는 편이 좋습니다. 다만 `%tky` 가 없는 특별한 자리가 있고, 그런 곳에서는 [[abapderived_types_pky|%pky]] 를 대신 씁니다. [[abenbdl_draft_action|draft action]] 이나 save action 의 구현이 그 예입니다.
- 생성 작업의 입력에는 `%tky` 를 쓸 수 없습니다.
- late numbering 에서는 `%tky` 안에 [[abapderived_types_pid|%pid]] 도 들어 있습니다. 자세한 내용은 [[abapderived_types_keys_identifiers]] 에 있습니다.

## 관련 항목

- [[abapderived_types_key]]
- [[abapderived_types_is_draft]]
- [[abapderived_types_pky]]
- [[abapderived_types_pid]]
- [[abapderived_types_keys_identifiers]]
- [[abenbdl_with_draft]]
- [[abenderived_types_tky_abexa]]
