---
title: 키 사용과 RAP BO 인스턴스 식별 한눈에 보기
summary: EML 에서 RAP BO 인스턴스를 가리키는 방법을 정리한 글로, %key·%tky·%cid·%pid 의 역할과 numbering·draft·late numbering 에서 달라지는 점을 설명합니다.
keywords: %key, %tky, %cid, %cid_ref, %pid, %pky, %pre, %tmp, %is_draft, 기본 키, 트랜잭션 키, 내용 ID, 임시 ID, 인스턴스 식별, 번호 부여, numbering, late numbering, early numbering, draft, adjust_numbers
---

## 설명

EML 문에서 키를 쓰고 인스턴스를 가리킬 때 알아야 할 점을 간추린 글입니다.

### 왜 중요한가

- RAP BO entity(엔터티) 인스턴스의 **기본 키**는 키 필드 하나 또는 여러 개로 이루어집니다. 키 필드는 기반 CDS 뷰 entity 에서 `key` 를 붙인 필드입니다.
- 기본 키는 인스턴스 하나하나를 유일하게 가리킵니다.
- 생성 작업으로 인스턴스를 기본 키와 함께 만들고 나면, 그 기본 키는 더 바꿀 수 없습니다.
- numbering 방식은 여러 가지입니다. late numbering 에서는 새 인스턴스가 데이터베이스에 저장되기 바로 전에야 최종 키를 받습니다. 그때까지 업무 로직은 임시 키를 쓰고, 이 임시 키는 나중에 최종 키로 바뀌어야 합니다.
- 같은 기본 키의 데이터가 persistent table 에 이미 있으면, 키가 겹치므로 인스턴스 저장이 거부됩니다.

### 인스턴스를 가리키는 두 가지 방법

인스턴스는 **RAP 인스턴스 식별자**나 **RAP 내용 식별자**로, 또는 둘을 함께 써서 가리킵니다.

**RAP 인스턴스 식별자**는 기본 키 필드와, 식별에 필요한 BDEF derived type(BDEF 파생 타입) 구성요소를 모두 합친 것입니다. 이것들을 이름 하나로 부를 수 있게 구성요소 묶음이 마련되어 있습니다.

- [[abapderived_types_key|%key]] : 인스턴스의 기본 키 필드가 들어 있습니다.
- [[abapderived_types_tky|%tky]] : 트랜잭션 키입니다. `%key` 에 더해, 인스턴스를 유일하게 가리키는 데 필요한 구성요소가 더 들어 있습니다. late numbering 에서 쓰는 [[abapderived_types_pid|%pid]] 와 draft 에서 쓰는 draft 표시 [[abapderived_types_is_draft|%is_draft]] 가 그것입니다. 원문의 이 글은 late numbering 도 draft 도 쓰지 않으면 이 구성요소들이 그냥 비어 있다고 적습니다. 하지만 원문의 `%pid` 항목과 [[abapderived_types_pky|%pky]] 항목은 `%pid` 가 late numbering 일 때만, `%is_draft` 가 draft 를 쓸 때만 있다고 설명합니다.

`%tky` 는 **모든 시나리오에서** 쓰기를 권합니다. 나중에 draft 시나리오 등으로 바꿀 때 키와 `%is_draft` 때문에 코드를 많이 고치지 않아도 되기 때문입니다.

**RAP 내용 식별자**는 구성요소 [[abapderived_types_cid|%cid]] 에 담깁니다. 타입이 `ABP_BEHV_CID` 인 문자열로, 내용 ID 를 정합니다.

- 생성 작업에서 인스턴스에 붙이는 유일한 임시 식별자입니다. 특히 그 인스턴스에 아직 기본 키가 없을 때 씁니다.
- 새로 만든 인스턴스를 이어서 더 고칠 때 이 ID 를 씁니다. [[abapderived_types_cid_ref|%cid_ref]] 에 `%cid` 와 같은 값을 넣어 그 인스턴스를 가리킵니다. `CREATE BY`, `UPDATE`, `DELETE` 작업과 `EXECUTE` 로 부르는 action 에서 그렇게 합니다([[abapmodify_entity_entities_op]]).
- 기본 키나 `%pid` 와 달리, `%cid` 와 `%cid_ref` 는 **잠깐만** 유효합니다. 한 RAP 트랜잭션의 interaction phase(상호작용 단계) 안에서, 지금의 EML 요청 하나에서만 쓸 수 있습니다.
- `%cid` 를 가리키는 다른 작업이 없더라도 `%cid` 는 적어 둡니다.

### late numbering 일 때

late numbering 에서는 새 인스턴스가 저장 직전에야 최종 키를 받습니다. 그래서 interaction phase 와 save sequence(저장 순서)의 앞쪽 단계에서는 임시 키를 다루게 됩니다.

- 임시 키는 `%key` 에 담아도 되고, 전용 구성요소 `%pid` 에 임시 ID 로 담아도 됩니다. `%pid` 는 타입이 `ABP_BEHV_PID` 이고 late numbering 일 때만 있습니다.
- 인스턴스를 유일하게 가리키는 데 `%key` 나 `%pid` 가운데 하나만 써도 되고 둘 다 써도 됩니다. 어느 쪽이든 두 구성요소가 다 들어 있는 `%tky` 를 쓰면 편합니다. 다만 `%tky` 전체로 보았을 때 인스턴스가 유일하게 가려지도록 해야 합니다.
- 키를 가리키는 구성요소 묶음이 하나 더 있습니다. [[abapderived_types_pky|%pky]] 입니다. late numbering 에서는 `%pid` 와 `%key` 가 들어 있고, 그렇지 않으면 `%key` 만 들어 있습니다. `%pky` 자체는 `%tky` 안에 들어 있습니다. 특정 action 처럼 `%tky` 는 없고 `%pky` 만 있는 상황이 있는데, 이때 `%pky` 로 `%pid` 와 `%key` 를 한 묶음으로 다룰 수 있습니다.

**기본 원칙** : interaction phase 에서 내부 처리가 이루어지려면, 인스턴스는 언제나 트랜잭션 키(`%tky`)로 유일하게 가려져야 합니다. `%tky` 에는 고른 시나리오에 필요한 구성요소가 언제나 다 들어 있습니다.

### 곁들여 알아 둘 RAP 개념

**numbering** 는 기본 키 필드의 값을 정하는 일입니다. 언제 정하느냐와 누가 정하느냐에 따라 나뉩니다.

| 기준 | 종류 | 내용 |
| --- | --- | --- |
| 언제 | early numbering | interaction phase 의 생성 작업 도중에 최종 키 값을 정합니다. |
| 언제 | late numbering | save sequence 안에서, 그것도 saver method(세이버 메서드) [[abensaver_adjust_numbers]] 에서만 최종 키 값을 정합니다. |
| 누가 | external numbering | RAP BO consumer(사용자)가 키 값을 줍니다. 생성 요청에서 다른 필드처럼 키 값도 함께 적습니다. |
| 누가 | internal numbering | RAP BO provider(제공자)가 키 값을 줍니다. 사용자는 생성 요청에 키 값을 적지 않습니다. |

internal numbering 은 구현 방식에 따라 다릅니다. managed BO 에서는 프레임워크가 키를 자동으로 만드는데, 키가 정해진 타입(16자리 바이트형 UUID)일 때만 됩니다. unmanaged BO 에서는 전용 handler method(핸들러 메서드)를 직접 구현해 키 값을 줍니다. late numbering 은 기본적으로 internal numbering 입니다. save sequence 의 뒤쪽 단계에서는 RAP BO consumer 가 더 끼어들 수 없기 때문입니다.

**draft** 은 transactional buffer(트랜잭션 버퍼)의 내용을 중간 저장소(draft 테이블)에 담아 두어, 트랜잭션이 여러 ABAP 세션에 걸쳐 이어질 수 있게 하는 개념입니다.

- draft 도 behavior definition(동작 정의)에서 켭니다. 켜면 데이터를 고치고 그 변경을 임시로 보관할 수 있지만, 아직 데이터베이스에 확정 저장하지는 않습니다. 사용자는 나중에 이어서 고칠 수 있고, 그때 다른 기기를 써도 됩니다.
- 인스턴스 식별에는 draft 표시 `%is_draft` 를 씁니다. 인스턴스가 draft 인지 active(활성)인지 나타냅니다. `%tky` 안에 `%is_draft` 가 들어 있으므로 `%tky` 로 함께 다룰 수 있습니다.

### save sequence 뒤쪽 단계에서의 식별 (late numbering)

최종 키 값은 saver method `adjust_numbers` 에서 정합니다. 임시 키는 `%key` 나 `%pid` 에, 또는 양쪽에 들어 있을 수 있습니다. `adjust_numbers` 에 들어오면 이 값들이 다음 구성요소 묶음으로 자동으로 옮겨집니다.

- [[abapderived_types_tmp|%tmp]] : `%key` 에 들어 있던 임시 키 값을 받습니다. interaction phase 에서 `%key` 가 하던 "임시 키 보관" 역할을 `%tmp` 가 넘겨받는 셈입니다.
- `%pid` 는 그대로 있습니다.
- [[abapderived_types_pre|%pre]] : `%pid` 와 `%tmp` 가 들어 있습니다. 곧 임시 식별자 전부입니다.

`adjust_numbers` 에서는 임시 키를 최종 키로 바꿉니다. response parameter(응답 매개변수) `mapped` 에서 임시 키를 `%key` 에 짝지어 주는데, 여기서 `%key` 는 최종 키를 담습니다. interaction phase 에서 `%pid` 를 썼든, `%key` 의 임시 키 값(이 메서드에서는 `%tmp`)을 썼든, 둘 다 썼든, `%pre` 전체가 유일하고 최종 키(`%key`)에 빠짐없이 짝지어지도록 해야 합니다.

## 예제

여행을 만들면서 `%cid` 로 이름을 붙이고, 같은 요청 안에서 `%cid_ref` 로 그 여행에 예약을 답니다. 이미 있는 여행은 `%tky` 로 가리킵니다.

```abap
MODIFY ENTITIES OF zr_travel
  ENTITY travel
    CREATE FIELDS ( travelid agencyid customerid )
    WITH VALUE #( ( %cid       = 'travel1'
                    travelid   = '00000009'
                    agencyid   = '070001'
                    customerid = '000010' ) )
    " 같은 요청에서 방금 만든 여행은 %cid_ref 로 가리킨다
    CREATE BY \_booking
    FIELDS ( bookingid flightdate flightprice currencycode )
    WITH VALUE #( ( %cid_ref = 'travel1'
                    %target  = VALUE #( ( %cid         = 'booking1'
                                          bookingid    = '0001'
                                          flightdate   = '20260301'
                                          flightprice  = '500.00'
                                          currencycode = 'EUR' ) ) ) )
    " 이미 있는 여행은 트랜잭션 키로 가리킨다
    UPDATE FIELDS ( status )
    WITH VALUE #( ( %tky-travelid = '00000001' status = 'A' ) )
  MAPPED DATA(ls_mapped)
  FAILED DATA(ls_failed)
  REPORTED DATA(ls_reported).
```

## 관련 항목

- [[abapderived_types_keys_id]]
- [[abapderived_types_key]]
- [[abapderived_types_tky]]
- [[abapderived_types_cid]]
- [[abapderived_types_cid_ref]]
- [[abapderived_types_pid]]
- [[abapderived_types_pky]]
- [[abapderived_types_is_draft]]
- [[abenbdl_late_numbering]]
- [[abenbdl_early_numb]]
- [[abenbdl_with_draft]]
- [[abenderived_types_abexas]]
