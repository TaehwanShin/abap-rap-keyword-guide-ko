---
title: %pky (임시 ID 와 키 묶음)
summary: 인스턴스를 만든 트랜잭션 안에서 식별자로 쓰는 구성요소 묶음으로, 보통은 %key 와 같고 late numbering 에서는 %pid 와 %key 를 합친 것입니다.
keywords: %pky, %key, %pid, %tky, 구성요소 묶음, 키 묶음, late numbering, 늦은 번호 부여, draft action, save action, CORRESPONDING, 키 묶음 대입
---

## 설명

`%pky` 는 BDEF derived type(BDEF 파생 타입)의 **구성요소 묶음**입니다. 인스턴스가 만들어진 트랜잭션 안에서 그 인스턴스의 식별자 구실을 합니다.

- [[abenbdl_late_numbering|late numbering]] 이 아닌 BO : `%pky` 는 [[abapderived_types_key|%key]] 와 같습니다. 따라서 저장된 인스턴스의 식별자이기도 합니다.
- late numbering 을 쓰는 BO : `%pky` 는 [[abapderived_types_pid|%pid]] 와 `%key` 를 합친 것입니다.

이 식별자는 인스턴스를 만든 때부터 다음 저장 때까지 바뀌지 않습니다.

### 쓰이는 곳

interaction phase(상호작용 단계)의 EML 문에서 `%key` 를 쓸 수 있는 자리에는 `%pky` 도 쓸 수 있습니다. 다만 **생성 작업은 예외**입니다.

`%pky` 는 키를 가리키는 또 하나의 길입니다. 다른 묶음과 견주면 이렇습니다.

- late numbering 이 아니면 `%pid` 가 없으므로 `%key` 와 `%pky` 가 같습니다.
- late numbering 도 아니고 [[abenbdl_with_draft|draft]] 도 아니면 [[abapderived_types_is_draft|%is_draft]] 도 없으므로 `%pky` 가 곧 [[abapderived_types_tky|%tky]] 입니다.

보통은 `%pky` 보다 `%tky` 를 쓰는 편이 낫습니다([[abapderived_types_keys_identifiers]]). 다만 `%tky` 가 없는 특별한 자리가 있고, 그런 곳에서는 `%pky` 를 대신 씁니다. [[abenbdl_draft_action|draft action]] 이나 save action 의 구현이 그 예입니다.

### 키 묶음끼리 대입하기

키 전체를 가리킬 때는 키 필드를 하나씩 늘어놓지 말고 키 구성요소 묶음을 쓰는 것이 좋습니다. 될 수 있으면 `%tky` 를 씁니다.

묶음끼리 대입할 때 다음 경우에는 타입이 맞는다는 보장이 없어서 문법 경고가 납니다.

- 같은 entity(엔터티)의 서로 다른 묶음을 섞을 때. 예) `wa-%tky = wa-%key`. 두 묶음에 든 구성요소가 똑같더라도 피합니다.
- 서로 다른 entity 의 같은 묶음을 섞을 때. 예) `wa_root-%tky = wa_child-%tky`. 나중에 구성요소가 늘어나면 전에는 되던 대입이 문법 오류가 될 수 있습니다.
- 키 묶음과 구성요소가 같은 구조 타입을 직접 만들어, 그 타입의 데이터 객체를 원래 키 묶음에 대입할 때.

이런 경우에는 `CORRESPONDING` 연산자로 타입을 맞춥니다. 반대로 같은 entity 의 같은 묶음끼리는 내용이 똑같으므로 바로 대입합니다. 이때 `CORRESPONDING` 은 필요 없고 성능도 더 나쁩니다. response parameter(응답 매개변수) `failed` 와 `reported` 에 키 묶음을 넣을 때가 그런 경우입니다.

## 예제

수정 작업에서 `%pky` 로 여행을 가리키고, 묶음끼리 대입하는 두 가지 방식을 보여 줍니다.

```abap
" %pky 로 키를 가리킨다 (생성 작업에서는 쓸 수 없다)
MODIFY ENTITY zr_travel
  UPDATE FIELDS ( status )
  WITH VALUE #( ( %pky-travelid = '00000007' status = 'A' ) )
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).

DATA ls_travel  TYPE STRUCTURE FOR READ RESULT zr_travel.
DATA ls_booking TYPE STRUCTURE FOR READ RESULT zr_booking.
DATA ls_update  TYPE STRUCTURE FOR UPDATE zr_travel.

" 서로 다른 entity 의 묶음: CORRESPONDING 으로 타입을 맞춘다
ls_update-%pky = CORRESPONDING #( ls_booking-%pky ).

" 같은 entity 의 같은 묶음: 바로 대입한다
ls_update-%pky = ls_travel-%pky.
```

## 알아두기

- 생성 작업의 입력에는 `%pky` 를 쓸 수 없습니다.
- late numbering 을 쓰는 unmanaged BO 에서 `%pky` 를 쓰는 모습은 [[abenderived_types_pre_tmp_abexa]] 에 나옵니다.

## 관련 항목

- [[abapderived_types_key]]
- [[abapderived_types_tky]]
- [[abapderived_types_pid]]
- [[abapderived_types_keys_identifiers]]
- [[abenbdl_late_numbering]]
- [[abenbdl_draft_action]]
- [[abenbdl_action_onsave]]
